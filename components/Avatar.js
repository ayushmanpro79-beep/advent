import styles from "./Avatar.module.css";

export function Avatar({ label, color = "purple" }) {
  return <span className={`${styles.avatar} ${styles[color]}`}>{label}</span>;
}
