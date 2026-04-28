import { Dice5 } from "lucide-react";
import { Avatar } from "./Avatar";
import styles from "./ChatMessage.module.css";

export function ChatMessage({ message }) {
  return (
    <article className={styles.message}>
      <Avatar label={message.avatar} color={message.color} />
      <div className={styles.content}>
        <div className={styles.meta}>
          <strong>{message.sender}</strong>
          {message.type === "ai" ? <span className={styles.dmTag}>GM</span> : null}
          <span>{message.time}</span>
        </div>
        <p>{message.text}</p>
        {message.roll ? (
          <div className={styles.roll}>
            <Dice5 size={17} />
            {message.roll}
          </div>
        ) : null}
        {message.prompt ? <em>{message.prompt}</em> : null}
      </div>
    </article>
  );
}
