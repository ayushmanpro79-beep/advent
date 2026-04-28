"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, UserRoundCheck } from "lucide-react";
import { Brand } from "@/components/Brand";
import { StatGrid } from "@/components/StatGrid";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/http";
import { classes, races } from "@/lib/game/config";
import { BASE_STAT_TOTAL, buildFinalStats, STAT_KEYS } from "@/lib/game/stats";
import styles from "./page.module.css";

export default function CharacterPage() {
  const router = useRouter();
  const { user, firebaseReady } = useAuth();
  const [name, setName] = useState("Arjun Shadowblade");
  const [race, setRace] = useState("Human");
  const [className, setClassName] = useState("Rogue");
  const [baseStats, setBaseStats] = useState({
    STR: 10,
    DEX: 10,
    MA: 10,
    EN: 10,
    ACC: 10,
    INT: 10,
    CHR: 10,
  });
  const [error, setError] = useState("");
  const total = STAT_KEYS.reduce((sum, key) => sum + Number(baseStats[key] || 0), 0);
  const { finalStats, bonusStat } = buildFinalStats(className, baseStats);

  function changeStat(key, value) {
    setBaseStats((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  async function saveCharacter() {
    setError("");
    if (total !== BASE_STAT_TOTAL) {
      setError(`Stats must total ${BASE_STAT_TOTAL}.`);
      return;
    }
    if (!firebaseReady || !user) {
      router.push("/");
      return;
    }

    try {
      await authedFetch("/api/characters/create", {
        user,
        body: { name, race, className, baseStats },
      });
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.form}>
        <Brand compact />
        <h1>Create your permanent character</h1>
        <p>
          This prototype treats your character as fixed after creation so campaign
          testing has a stable player identity.
        </p>
        <label>
          Character name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <div className={styles.row}>
          <label>
            Race
            <select value={race} onChange={(event) => setRace(event.target.value)}>
              {races.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Class
            <select value={className} onChange={(event) => setClassName(event.target.value)}>
              {classes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.statEditor}>
          <div className={styles.total}>
            <span>Base stat pool</span>
            <strong>
              {total} / {BASE_STAT_TOTAL}
            </strong>
          </div>
          {STAT_KEYS.map((key) => (
            <label key={key}>
              {key}
              <input
                type="number"
                min="1"
                max="20"
                value={baseStats[key]}
                onChange={(event) => changeStat(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <div className={styles.bonus}>Class bonus: +3 {bonusStat}</div>
        {error ? <div className={styles.error}>{error}</div> : null}
        <button type="button" onClick={saveCharacter} className={styles.primary}>
          <UserRoundCheck size={19} /> Save Character
        </button>
      </section>

      <section className={styles.preview}>
        <div className={styles.locked}>
          <Lock size={18} /> One-time account character
        </div>
        <h2>{name || "Unnamed Hero"}</h2>
        <p>
          Level 1 {className}
          <br />
          {race}
        </p>
        <StatGrid stats={finalStats} />
      </section>
    </main>
  );
}
