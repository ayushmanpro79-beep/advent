import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    firebaseWebConfig: Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ),
    firebaseAdminConfig: Boolean(
      (process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    ),
    aiProvider: process.env.AI_PROVIDER || "",
    openAiModel: process.env.OPENAI_MODEL || "",
    openAiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
  });
}
