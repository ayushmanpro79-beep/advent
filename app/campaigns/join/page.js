"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/http";
import styles from "./page.module.css";

export default function JoinCampaignPage() {
  const { user, firebaseReady } = useAuth();
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [error, setError] = useState("");
  const showPreview = code.trim().length > 2;

  async function joinCampaign() {
    setError("");
    if (!firebaseReady || !user) {
      setError("Sign in with Firebase before joining a campaign.");
      return;
    }

    try {
      const result = await authedFetch("/api/campaigns/join", {
        user,
        body: { inviteCode: code },
      });
      setCampaignId(result.campaignId);
      setJoined(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className={styles.page}>
          <section className={styles.card}>
          <h1>Join Campaign</h1>
          <p>Enter an invite code from a friend to preview and join their campaign room.</p>
          <label>
            Invite code
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="ELD-2048"
            />
          </label>
          {showPreview ? (
            <div className={styles.preview}>
              <span>Invite code ready</span>
              <h2>{code}</h2>
              <p>Join will verify this invite code against Firestore.</p>
              {joined ? (
                <Link href={`/campaigns/${campaignId}`}>Continue to Campaign</Link>
              ) : (
                <button type="button" onClick={joinCampaign}>
                  Join Campaign
                </button>
              )}
              {error ? <p className={styles.error}>{error}</p> : null}
            </div>
          ) : null}
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
