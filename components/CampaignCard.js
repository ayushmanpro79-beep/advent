import Link from "next/link";
import { Crown, MoreVertical, Users } from "lucide-react";
import styles from "./CampaignCard.module.css";

export function CampaignCard({ campaign }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3>{campaign.name}</h3>
          <p>{campaign.description}</p>
        </div>
        <div className={styles.actions}>
          <span className={`${styles.badge} ${styles[campaign.statusTone]}`}>
            {campaign.status}
          </span>
          <MoreVertical size={20} />
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.meta}>
          <span>
            <Users size={18} /> {campaign.players} / {campaign.maxPlayers} Players
          </span>
          <span>
            <Users size={18} /> Min {campaign.minimumPlayers}
          </span>
          <span>
            <Crown size={18} /> {campaign.role}
          </span>
        </div>
        <Link href={`/campaigns/${campaign.id}`} className={styles.continue}>
          Continue
        </Link>
      </div>
    </article>
  );
}
