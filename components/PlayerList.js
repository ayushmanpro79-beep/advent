import { Avatar } from "./Avatar";
import styles from "./PlayerList.module.css";

export function PlayerList({ players = [] }) {
  return (
    <section className={styles.list}>
      <h3>
        Online Players <span />
      </h3>
      {!players.length ? <p className={styles.empty}>No players loaded.</p> : null}
      {players.map((player) => (
        <div className={styles.player} key={player.id}>
          <Avatar label={player.avatar} color={player.color} />
          <span>{player.name}</span>
          <strong>{player.status}</strong>
        </div>
      ))}
    </section>
  );
}
