import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getAdminDb, FieldValue } from "@/lib/firebase/admin";

function makeInviteCode() {
  return `ADVN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const body = await request.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const minimumPlayers = Number(body.minimumPlayers || 1);

  if (!name) return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
  if (!Number.isInteger(minimumPlayers) || minimumPlayers < 1 || minimumPlayers > 4) {
    return NextResponse.json({ error: "Minimum players must be from 1 to 4." }, { status: 400 });
  }

  const db = getAdminDb();
  const character = await db.collection("characters").doc(user.uid).get();
  if (!character.exists) {
    return NextResponse.json({ error: "Create a character first." }, { status: 400 });
  }

  const inviteCode = makeInviteCode();
  const campaignRef = db.collection("campaigns").doc();
  const displayName = user.name || user.email || "Adventurer";

  await campaignRef.set({
    name,
    description,
    hostId: user.uid,
    inviteCode,
    maxPlayers: 4,
    minimumPlayers,
    minimumPlayersToStart: minimumPlayers,
    playerIds: [user.uid],
    activeTurnUserId: user.uid,
    turnOrder: [user.uid],
    status: minimumPlayers === 1 ? "Active" : "Waiting for Players",
    statusTone: minimumPlayers === 1 ? "green" : "orange",
    players: 1,
    members: [
      {
        uid: user.uid,
        displayName,
        avatar: displayName[0]?.toUpperCase() || "A",
        joinedAt: Date.now(),
      },
    ],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await campaignRef.collection("worldBible").doc("current").set({
    summary: "No world bible has been written yet.",
    people: [],
    places: [],
    events: [],
    openThreads: [],
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, campaignId: campaignRef.id, inviteCode });
}
