import { NextResponse } from "next/server";
import { requireUser, upsertUserProfile } from "@/lib/auth/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(request) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  await upsertUserProfile(user);
  const db = getAdminDb();
  const [profileSnapshot, characterSnapshot] = await Promise.all([
    db.collection("users").doc(user.uid).get(),
    db.collection("characters").doc(user.uid).get(),
  ]);

  return NextResponse.json({
    ok: true,
    profile: profileSnapshot.exists ? profileSnapshot.data() : null,
    character: characterSnapshot.exists ? { id: characterSnapshot.id, ...characterSnapshot.data() } : null,
  });
}
