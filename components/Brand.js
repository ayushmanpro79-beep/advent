import { Sparkles } from "lucide-react";
import styles from "./Brand.module.css";

export function Brand({ compact = false }) {
  return (
    <div className={styles.brand}>
      <Sparkles size={compact ? 26 : 34} strokeWidth={1.8} />
      <span>advent</span>
    </div>
  );
}
