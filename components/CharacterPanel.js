"use client";

import { Heart, Shield, User, Footprints } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { emptyCharacterDisplay } from "@/lib/game/config";
import { StatGrid } from "./StatGrid";
import styles from "./CharacterPanel.module.css";

export function CharacterPanel() {
  const { character: liveCharacter } = useAuth();
  const activeCharacter = liveCharacter
    ? {
        ...emptyCharacterDisplay,
        name: liveCharacter.name,
        race: liveCharacter.race,
        className: liveCharacter.className,
        stats: liveCharacter.finalStats,
        level: 1,
        xp: "0 / 1,000",
      }
    : emptyCharacterDisplay;

  return (
    <aside className={styles.panel}>
      <div className={styles.heading}>
        <User size={21} />
        <h2>Your Character</h2>
      </div>
      <div className={styles.divider} />
      <h3>{activeCharacter.name}</h3>
      <p>
        Level {activeCharacter.level} {activeCharacter.className}
        <br />
        {activeCharacter.race}
      </p>
      <div className={styles.xpRow}>
        <span>XP</span>
        <span>{activeCharacter.xp}</span>
      </div>
      <div className={styles.progress}>
        <span />
      </div>
      <StatGrid stats={activeCharacter.stats} />
      <div className={styles.vitals}>
        <div>
          <Heart size={24} />
          <span>HP</span>
          <strong>{activeCharacter.hp}</strong>
        </div>
        <div>
          <Shield size={24} />
          <span>AC</span>
          <strong>{activeCharacter.ac}</strong>
        </div>
        <div>
          <Footprints size={24} />
          <span>Speed</span>
          <strong>{activeCharacter.speed}</strong>
        </div>
      </div>
      <h4>Proficiencies</h4>
      <p>{activeCharacter.proficiencies}</p>
      <div className={styles.divider} />
      <h4>Inventory</h4>
      <div className={styles.inventory}>
        {activeCharacter.inventory.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </aside>
  );
}
