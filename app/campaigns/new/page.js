"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/http";
import styles from "./page.module.css";

export default function NewCampaignPage() {
  const { user, firebaseReady } = useAuth();
  const [minimumPlayers, setMinimumPlayers] = useState(1);
  const [created, setCreated] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function createCampaign() {
    setError("");
    if (!firebaseReady || !user) {
      setError("Sign in with Firebase before creating a campaign.");
      return;
    }

    try {
      const result = await authedFetch("/api/campaigns/create", {
        user,
        body: { name, description, minimumPlayers },
      });
      setCampaignId(result.campaignId);
      setInviteCode(result.inviteCode);
      setCreated(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className={styles.page}>
          <section className={styles.card}>
          <h1>Create New Campaign</h1>
          <p>Set up a campaign room for solo or multiplayer testing. Max players is fixed at 4.</p>
          <label>
            Campaign name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Shadows of Eldoria" />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A dark mystery unfolds in an ancient kingdom..."
            />
          </label>
          <div className={styles.group}>
            <span>Minimum players required to start</span>
            <div className={styles.segment}>
              {[1, 2, 3, 4].map((count) => (
                <button
                  className={minimumPlayers === count ? styles.selected : ""}
                  key={count}
                  onClick={() => setMinimumPlayers(count)}
                  type="button"
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.note}>
            {minimumPlayers === 1
              ? "Solo play enabled. The campaign can start with only you."
              : `${minimumPlayers} players must join before play starts.`}
          </div>
          <button className={styles.primary} type="button" onClick={createCampaign}>
            Create Campaign
          </button>
          {error ? <div className={styles.error}>{error}</div> : null}
          {created ? (
            <div className={styles.success}>
              Campaign created. Invite code: <strong>{inviteCode}</strong>
              <Link href={`/campaigns/${campaignId}`}>Enter playthrough</Link>
            </div>
          ) : null}
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
