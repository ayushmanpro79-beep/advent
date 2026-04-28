"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./ProtectedRoute.module.css";

export function ProtectedRoute({ children, requireCharacter = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, character, loading, firebaseReady } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!firebaseReady || !user) {
      router.replace("/login");
      return;
    }
    if (requireCharacter && !character) {
      router.replace("/character");
    }
  }, [character, firebaseReady, loading, requireCharacter, router, user]);

  if (loading) {
    return <main className={styles.center}>Loading Advent...</main>;
  }

  if (!firebaseReady) {
    return <main className={styles.center}>Firebase is not configured.</main>;
  }

  if (!user) {
    return <main className={styles.center}>Redirecting to login...</main>;
  }

  if (requireCharacter && !character && pathname !== "/character") {
    return <main className={styles.center}>Redirecting to character creation...</main>;
  }

  return children;
}
