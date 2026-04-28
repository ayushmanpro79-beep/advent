import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { resolveActionWithAi } from "@/lib/ai/openai";
import { getAdminDb, FieldValue } from "@/lib/firebase/admin";

function statModifier(finalStats, stat) {
  const value = finalStats?.[stat]?.modifier;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function nextTurn(turnOrder, currentUserId) {
  const index = turnOrder.indexOf(currentUserId);
  if (index < 0) return turnOrder[0];
  return turnOrder[(index + 1) % turnOrder.length];
}

export async function POST(request, context) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const { id } = await context.params;
  const { actionText } = await request.json();
  const text = String(actionText || "").trim();
  if (!text) return NextResponse.json({ error: "Action text is required." }, { status: 400 });

  const db = getAdminDb();
  const campaignRef = db.collection("campaigns").doc(id);
  const characterRef = db.collection("characters").doc(user.uid);
  const worldRef = campaignRef.collection("worldBible").doc("current");

  const [campaignSnapshot, characterSnapshot, worldSnapshot, recentSnapshot] = await Promise.all([
    campaignRef.get(),
    characterRef.get(),
    worldRef.get(),
    campaignRef.collection("messages").orderBy("timestamp", "desc").limit(12).get(),
  ]);

  if (!campaignSnapshot.exists) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  if (!characterSnapshot.exists) return NextResponse.json({ error: "Create a character first." }, { status: 400 });

  const campaign = campaignSnapshot.data();
  if (!campaign.playerIds?.includes(user.uid)) {
    return NextResponse.json({ error: "You are not in this campaign." }, { status: 403 });
  }
  if (campaign.status !== "Active") {
    return NextResponse.json({ error: "Campaign is not active yet." }, { status: 400 });
  }
  if (campaign.activeTurnUserId !== user.uid) {
    return NextResponse.json({ error: "It is not your turn." }, { status: 403 });
  }

  const roll = Math.ceil(Math.random() * 20);
  const character = characterSnapshot.data();
  const recentMessages = recentSnapshot.docs.reverse().map((doc) => doc.data());
  let ai;
  try {
    ai = await resolveActionWithAi({
      actionText: text,
      character,
      recentMessages,
      worldBible: worldSnapshot.exists ? worldSnapshot.data() : null,
      roll,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "OpenAI could not resolve this action." },
      { status: 502 },
    );
  }
  const modifier = statModifier(character.finalStats, ai.stat);
  const total = roll + modifier;
  const nextUserId = nextTurn(campaign.turnOrder || campaign.playerIds, user.uid);
  const displayName = user.name || user.email || "Adventurer";

  await db.runTransaction(async (transaction) => {
    const freshCampaign = await transaction.get(campaignRef);
    if (freshCampaign.data()?.activeTurnUserId !== user.uid) {
      throw new Error("Turn already advanced.");
    }

    const playerMessage = campaignRef.collection("messages").doc();
    const aiMessage = campaignRef.collection("messages").doc();
    transaction.set(playerMessage, {
      senderId: user.uid,
      sender: displayName,
      avatar: displayName[0]?.toUpperCase() || "A",
      color: "purple",
      type: "player",
      text,
      roll: `Roll: ${roll} + ${ai.stat} (${modifier >= 0 ? `+${modifier}` : modifier}) = ${total}`,
      stat: ai.stat,
      difficulty: ai.difficulty,
      successTone: ai.successTone,
      rollValue: roll,
      modifier,
      total,
      timestamp: FieldValue.serverTimestamp(),
    });
    transaction.set(aiMessage, {
      senderId: "AI",
      sender: "AI Game Master",
      avatar: "*",
      color: "dark",
      type: "ai",
      text: ai.narration,
      prompt: "What do you do?",
      timestamp: FieldValue.serverTimestamp(),
    });
    transaction.update(campaignRef, {
      activeTurnUserId: nextUserId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return NextResponse.json({ ok: true, stat: ai.stat, roll, modifier, total, narration: ai.narration });
}
