import { Avatar } from "./Avatar";
import styles from "./TurnOrder.module.css";

export function TurnOrder({ players = [] }) {
  return (
    <section className={styles.turnOrder}>
      <span>Turn Order</span>
      <div className={styles.players}>
        {!players.length ? <p className={styles.empty}>Turn order unavailable.</p> : null}
        {players.map((player, index) => (
          <div className={styles.turnItem} key={player.id}>
            <Avatar label={player.avatar} color={player.color} />
            <p>{player.name}</p>
            {index < players.length - 1 ? <strong>→</strong> : null}
          </div>
        ))}
      </div>
      <b>Your Turn</b>
    </section>
  );
}
