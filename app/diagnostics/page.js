"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

export default function DiagnosticsPage() {
  const { user, character, firebaseReady } = useAuth();
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => {
    fetch("/api/diagnostics")
      .then((response) => response.json())
      .then(setDiagnostics)
      .catch(() => setDiagnostics({ error: "Could not load diagnostics." }));
  }, []);

  return (
    <AppShell>
      <section className={styles.panel}>
        <h1>Diagnostics</h1>
        <p>Non-secret setup status for debugging online play.</p>
        <Status label="Firebase client config" ok={firebaseReady && diagnostics?.firebaseWebConfig} />
        <Status label="Firebase admin config" ok={diagnostics?.firebaseAdminConfig} />
        <Status label="Signed in" ok={Boolean(user)} />
        <Status label="Character loaded" ok={Boolean(character)} />
        <Status label="AI provider is OpenAI" ok={diagnostics?.aiProvider === "openai"} />
        <Status label={`OpenAI model: ${diagnostics?.openAiModel || "missing"}`} ok={Boolean(diagnostics?.openAiModel)} />
        <Status label="OpenAI key present" ok={diagnostics?.openAiKeyPresent} />
      </section>
    </AppShell>
  );
}

function Status({ label, ok }) {
  return (
    <div className={styles.row}>
      <span className={ok ? styles.ok : styles.bad}>{ok ? "OK" : "Check"}</span>
      <strong>{label}</strong>
    </div>
  );
}
