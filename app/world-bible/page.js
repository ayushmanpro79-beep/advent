import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WorldBibleList } from "@/components/WorldBibleList";
import styles from "./page.module.css";

export default function WorldBiblePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <div className={styles.header}>
          <h1>World Bible</h1>
          <p>Campaign memories collected for AI context and player reference.</p>
        </div>
        <WorldBibleList />
      </AppShell>
    </ProtectedRoute>
  );
}
