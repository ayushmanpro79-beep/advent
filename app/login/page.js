"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Sparkles } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { login, firebaseReady, user, character, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(character ? "/" : "/character");
  }, [character, loading, router, user]);

  async function handleLogin() {
    if (firebaseReady) {
      await login();
    }
    router.push("/character");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Brand />
        <div className={styles.mark}>
          <Sparkles size={34} />
        </div>
        <h1>Begin your next shared story.</h1>
        <p>
          Sign in to create a permanent character, join campaign rooms, and test the
          multiplayer Advent prototype with friends.
        </p>
        <button type="button" onClick={handleLogin} className={styles.google}>
          <LogIn size={20} /> Continue with Google
        </button>
      </section>
    </main>
  );
}
