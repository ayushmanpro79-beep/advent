"use client";

import { useState } from "react";
import { Info, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/http";
import styles from "./DmPanel.module.css";

export function DmPanel({ campaignId, players = [] }) {
  const { user, firebaseReady } = useAuth();
  const recipients = players.filter((player) => player.id !== (user?.uid || "arjun"));
  const [recipient, setRecipient] = useState(recipients[0]?.id || "");
  const [text, setText] = useState("");
  const [sent, setSent] = useState("");

  async function sendDm() {
    if (!text.trim()) return;
    const to = recipients.find((player) => player.id === recipient)?.name || "player";

    if (firebaseReady && user && campaignId) {
      try {
        await authedFetch(`/api/campaigns/${campaignId}/dm`, {
          user,
          body: { recipientId: recipient, text },
        });
      } catch (err) {
        setSent(err.message);
        return;
      }
    }

    setSent(`Private message sent to ${to}.`);
    setText("");
  }

  return (
    <section className={styles.card}>
      <div className={styles.title}>
        <Send size={22} />
        <div>
          <h3>DM (Direct Message)</h3>
          <p>
            Manual player-to-player message. <Info size={13} />
          </p>
        </div>
      </div>
      <label>Send DM to</label>
      <select value={recipient} onChange={(event) => setRecipient(event.target.value)}>
        {!recipients.length ? <option>No other players online</option> : null}
        {recipients.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value.slice(0, 500))}
        placeholder="Type your private message..."
      />
      <div className={styles.count}>{text.length} / 500</div>
      <button type="button" onClick={sendDm} disabled={!recipients.length}>
        <Send size={17} /> Send DM
      </button>
      {sent ? <p className={styles.sent}>{sent}</p> : null}
    </section>
  );
}
