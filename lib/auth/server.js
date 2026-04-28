import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, FieldValue } from "@/lib/firebase/admin";

export async function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return { error: NextResponse.json({ error: "Missing auth token" }, { status: 401 }) };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { user: decoded };
  } catch {
    return { error: NextResponse.json({ error: "Invalid auth token" }, { status: 401 }) };
  }
}

export async function upsertUserProfile(decodedUser) {
  const db = getAdminDb();
  const ref = db.collection("users").doc(decodedUser.uid);
  const snapshot = await ref.get();
  const payload = {
    uid: decodedUser.uid,
    email: decodedUser.email || "",
    displayName: decodedUser.name || decodedUser.email || "Adventurer",
    photoURL: decodedUser.picture || "",
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snapshot.exists) {
    await ref.set({
      ...payload,
      hasCharacter: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    await ref.set(payload, { merge: true });
  }
}
