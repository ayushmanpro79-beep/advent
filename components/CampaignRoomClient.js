"use client";

import { useMemo, useState } from "react";
import { Info, Send, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ChatMessage } from "@/components/ChatMessage";
import { DmPanel } from "@/components/DmPanel";
import { PlayerList } from "@/components/PlayerList";
import { TurnOrder } from "@/components/TurnOrder";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaignRoom } from "@/hooks/useCampaignRoom";
import { authedFetch } from "@/lib/http";
import styles from "@/app/campaigns/[id]/page.module.css";

export function CampaignRoomClient({ campaignId }) {
  const { user, firebaseReady } = useAuth();
  const { campaign, messages, players, loading, error: roomError } = useCampaignRoom(campaignId);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  const [worldStatus, setWorldStatus] = useState("");

  const canPlay = Boolean(campaign && campaign.players >= campaign.minimumPlayers);
  const subtitle = useMemo(
    () =>
      campaign
        ? `${campaign.players} / ${campaign.maxPlayers} Players - Minimum ${campaign.minimumPlayers}`
        : "Campaign unavailable",
    [campaign],
  );

  async function submitAction() {
    if (!action.trim() || !canPlay) return;
    setError("");

    if (!firebaseReady || !user) {
      setError("Firebase login is required for story actions.");
      return;
    }

    try {
      await authedFetch(`/api/campaigns/${campaignId}/action`, {
        user,
        body: { actionText: action },
      });
      setAction("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function refreshWorldBible() {
    setWorldStatus("");
    if (!firebaseReady || !user) {
      setWorldStatus("World bible refreshed locally.");
      return;
    }

    try {
      await authedFetch(`/api/campaigns/${campaignId}/world-bible/refresh`, { user });
      setWorldStatus("World bible refreshed.");
    } catch (err) {
      setWorldStatus(err.message);
    }
  }

  return (
    <AppShell campaignTitle={campaign?.name || "Campaign"} campaignStatus={campaign?.status || "Loading"}>
      <div className={styles.room}>
        <section className={styles.story}>
          <div className={styles.roomHeader}>
            <div>
              <h1>{campaign?.name || "Campaign"}</h1>
              <p>
                <Users size={16} /> {subtitle}
              </p>
            </div>
            <button type="button">End Campaign</button>
          </div>

          <div className={styles.gmBanner}>
            <Sparkles size={24} />
            <div>
              <strong>AI Game Master</strong>
              <span>GM</span>
              <p>The AI Game Master narrates the world and NPCs. Player DMs are private and do not affect the story.</p>
            </div>
          </div>

          <div className={styles.messages}>
            {loading ? <p className={styles.state}>Loading campaign...</p> : null}
            {roomError ? <p className={styles.error}>{roomError}</p> : null}
            {!loading && !roomError && !messages.length ? (
              <p className={styles.state}>No story messages yet. The active player can begin the scene.</p>
            ) : null}
            {messages.map((message) => (
              <ChatMessage message={message} key={message.id} />
            ))}
          </div>

          <div className={styles.composer}>
            <input
              disabled={!canPlay}
              value={action}
              onChange={(event) => setAction(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitAction();
              }}
              placeholder={canPlay ? "What do you want to do?" : "Waiting for more players..."}
            />
            <button aria-label="Send action" onClick={submitAction} type="button">
              <Send size={25} />
            </button>
          </div>
          <p className={styles.helper}>
            {canPlay ? "Only the current player can send a story action." : "This campaign needs more players before it can begin."}
          </p>
          {error ? <p className={styles.error}>{error}</p> : null}

          <TurnOrder players={players} />
        </section>

        <aside className={styles.side}>
          <section className={styles.infoCard}>
            <h2>
              <Info size={21} /> Turn Information
            </h2>
            <div className={styles.infoRow}>
              <span>Current Turn</span>
              <strong>Arjun (You)</strong>
            </div>
            <div className={styles.infoRow}>
              <span>Campaign State</span>
              <strong>{canPlay ? "Playable" : "Waiting"}</strong>
            </div>
            <div className={styles.progress}>
              <span style={{ width: canPlay ? "100%" : "54%" }} />
            </div>
            <button className={styles.secondaryButton} type="button" onClick={refreshWorldBible}>
              Refresh World Bible
            </button>
            {worldStatus ? <p className={styles.worldStatus}>{worldStatus}</p> : null}
          </section>
          <DmPanel campaignId={campaignId} players={players} />
          <section className={styles.about}>
            <h3>About DM</h3>
            <p>DMs are private and only visible to the selected player.</p>
            <p>DMs do not affect the AI Game Master or the story.</p>
            <p>Use DM to share plans, hints, or table chatter.</p>
          </section>
          <PlayerList players={players} />
        </aside>
      </div>
    </AppShell>
  );
}
