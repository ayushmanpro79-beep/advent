import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getAdminDb, FieldValue } from "@/lib/firebase/admin";

export async function POST(request, context) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const { id } = await context.params;
  const { recipientId, text } = await request.json();
  const message = String(text || "").trim().slice(0, 500);

  if (!recipientId) return NextResponse.json({ error: "Recipient is required." }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const db = getAdminDb();
  const campaignRef = db.collection("campaigns").doc(id);
  const campaignSnapshot = await campaignRef.get();
  if (!campaignSnapshot.exists) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const campaign = campaignSnapshot.data();
  if (!campaign.playerIds?.includes(user.uid) || !campaign.playerIds?.includes(recipientId)) {
    return NextResponse.json({ error: "Both users must be campaign members." }, { status: 403 });
  }

  await campaignRef.collection("dms").add({
    senderId: user.uid,
    recipientId,
    text: message,
    participants: [user.uid, recipientId],
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}
