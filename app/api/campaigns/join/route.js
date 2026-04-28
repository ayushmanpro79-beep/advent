import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getAdminDb, FieldValue } from "@/lib/firebase/admin";

export async function POST(request) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const { inviteCode } = await request.json();
  const code = String(inviteCode || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "Invite code is required." }, { status: 400 });

  const db = getAdminDb();
  const matches = await db.collection("campaigns").where("inviteCode", "==", code).limit(1).get();
  if (matches.empty) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const campaignRef = matches.docs[0].ref;
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(campaignRef);
    const campaign = snapshot.data();
    const playerIds = campaign.playerIds || [];
    const members = campaign.members || [];

    if (playerIds.includes(user.uid)) return;
    if (playerIds.length >= 4) throw new Error("Campaign is full.");

    const displayName = user.name || user.email || "Adventurer";
    const nextPlayerIds = [...playerIds, user.uid];
    const nextTurnOrder = [...(campaign.turnOrder || playerIds), user.uid];
    const nextStatus =
      nextPlayerIds.length >= Number(campaign.minimumPlayers || campaign.minimumPlayersToStart || 1)
        ? "Active"
        : "Waiting for Players";

    transaction.update(campaignRef, {
      playerIds: nextPlayerIds,
      turnOrder: nextTurnOrder,
      players: nextPlayerIds.length,
      status: nextStatus,
      statusTone: nextStatus === "Active" ? "green" : "orange",
      members: [
        ...members,
        {
          uid: user.uid,
          displayName,
          avatar: displayName[0]?.toUpperCase() || "A",
          joinedAt: Date.now(),
        },
      ],
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return NextResponse.json({ ok: true, campaignId: matches.docs[0].id });
}
