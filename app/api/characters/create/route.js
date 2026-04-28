import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { getAdminDb, FieldValue } from "@/lib/firebase/admin";
import { buildFinalStats, CLASSES, RACES, validateBaseStats } from "@/lib/game/stats";

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    const name = String(body.name || "").trim();
    const race = String(body.race || "");
    const className = String(body.className || "");
    const baseStats = body.baseStats || {};

    if (!name) return NextResponse.json({ error: "Character name is required." }, { status: 400 });
    if (!RACES.includes(race)) return NextResponse.json({ error: "Invalid race." }, { status: 400 });
    if (!CLASSES.includes(className)) return NextResponse.json({ error: "Invalid class." }, { status: 400 });

    const statError = validateBaseStats(baseStats);
    if (statError) return NextResponse.json({ error: statError }, { status: 400 });

    const db = getAdminDb();
    const characterRef = db.collection("characters").doc(user.uid);
    const userRef = db.collection("users").doc(user.uid);
    const { finalStats, bonusStat } = buildFinalStats(className, baseStats);

    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(characterRef);
      if (existing.exists && existing.data()?.locked) {
        throw new Error("Character is already locked.");
      }

      transaction.set(characterRef, {
        uid: user.uid,
        name,
        race,
        className,
        baseStats,
        finalStats,
        classBonusStat: bonusStat,
        locked: true,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.set(
        userRef,
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.name || user.email || "Adventurer",
          photoURL: user.picture || "",
          hasCharacter: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err.message || "Character creation failed.";
    const status = message === "Character is already locked." ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
