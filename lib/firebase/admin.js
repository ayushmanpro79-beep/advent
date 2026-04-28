import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function getAdminCredentials() {
  const projectId = cleanEnv(process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const clientEmail = cleanEnv(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = cleanEnv(process.env.FIREBASE_ADMIN_PRIVATE_KEY)?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  return { projectId, clientEmail, privateKey };
}

function cleanEnv(value) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

export function getAdminApp() {
  if (getApps().length) return getApps()[0];

  return initializeApp({
    credential: cert(getAdminCredentials()),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export { FieldValue };
