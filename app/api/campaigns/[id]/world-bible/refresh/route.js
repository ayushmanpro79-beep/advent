import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { summarizeWorldBible } from "@/lib/ai/openai";
import { getAdminDb, FieldValue } from "@/lib/firebase/admin";

export async function POST(request, context) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const { id } = await context.params;
  const db = getAdminDb();
  const campaignRef = db.collection("campaigns").doc(id);
  const campaignSnapshot = await campaignRef.get();
  if (!campaignSnapshot.exists) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const campaign = campaignSnapshot.data();
  if (campaign.hostId !== user.uid) {
    return NextResponse.json({ error: "Only the host can refresh the world bible." }, { status: 403 });
  }

  const messagesSnapshot = await campaignRef.collection("messages").orderBy("timestamp", "asc").limit(120).get();
  const messages = messagesSnapshot.docs.map((doc) => doc.data());
  let bible;
  try {
    bible = await summarizeWorldBible({ campaign, messages });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "OpenAI could not refresh the world bible." },
      { status: 502 },
    );
  }

  await campaignRef.collection("worldBible").doc("current").set(
    {
      ...bible,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true, worldBible: bible });
}
