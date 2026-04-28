import styles from "./StatGrid.module.css";

export function StatGrid({ stats }) {
  return (
    <div className={styles.grid}>
      {Object.entries(stats).map(([label, stat]) => (
        <div className={styles.stat} key={label}>
          <span>{label}</span>
          <strong>{stat.score}</strong>
          <small>{stat.modifier}</small>
        </div>
      ))}
    </div>
  );
}
