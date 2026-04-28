"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useWorldBibles } from "@/hooks/useWorldBibles";
import styles from "./WorldBibleList.module.css";

export function WorldBibleList() {
  const { worldBibles } = useWorldBibles();
  const [activeId, setActiveId] = useState(worldBibles[0]?.id || "");
  const active = worldBibles.find((bible) => bible.id === activeId) || worldBibles[0];

  useEffect(() => {
    if (!activeId && worldBibles[0]) setActiveId(worldBibles[0].id);
  }, [activeId, worldBibles]);

  if (!active) {
    return (
      <div className={styles.layout}>
        <section className={styles.detail}>
          <h2>No World Bibles Yet</h2>
          <p>Create or join a campaign to begin building campaign memory.</p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <section className={styles.list}>
        <h2>World Bibles</h2>
        {worldBibles.map((bible) => (
          <button
            className={bible.id === activeId ? styles.active : ""}
            key={bible.id}
            onClick={() => setActiveId(bible.id)}
            type="button"
          >
            <BookOpen size={21} />
            <span>{bible.campaign}</span>
          </button>
        ))}
      </section>
      <section className={styles.detail}>
        <h2>{active.campaign}</h2>
        <p>{active.summary}</p>
        <BibleGroup title="Important People" items={active.people} />
        <BibleGroup title="Places" items={active.places} />
        <BibleGroup title="Events" items={active.events} />
        <BibleGroup title="Open Threads" items={active.openThreads} />
      </section>
    </div>
  );
}

function BibleGroup({ title, items }) {
  return (
    <div className={styles.group}>
      <h3>{title}</h3>
      <div>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
