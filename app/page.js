"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { CharacterPanel } from "@/components/CharacterPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useCampaigns } from "@/hooks/useCampaigns";
import styles from "./page.module.css";

export default function HomePage() {
  const { profile } = useAuth();
  const { campaigns, loading, error, empty } = useCampaigns();
  const displayName = profile?.displayName || "Adventurer";

  return (
    <AppShell>
      <div className={styles.homeGrid}>
        <section>
          <h1>Welcome back, {displayName}!</h1>
          <p className={styles.lead}>Your adventures await. Continue your stories or start a new one.</p>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Your Campaigns</h2>
              <Link href="/campaigns/new" className={styles.primaryButton}>
                <Plus size={20} /> Create Campaign
              </Link>
            </div>
            <div className={styles.campaigns}>
              {loading ? <p className={styles.state}>Loading campaigns...</p> : null}
              {error ? <p className={styles.error}>{error}</p> : null}
              {empty ? <p className={styles.state}>No campaigns yet. Create one or join with an invite code.</p> : null}
              {!loading && !error
                ? campaigns.map((campaign) => <CampaignCard campaign={campaign} key={campaign.id} />)
                : null}
            </div>
          </div>
        </section>
        <CharacterPanel />
      </div>
    </AppShell>
  );
}
