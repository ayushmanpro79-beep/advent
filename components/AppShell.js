"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, Home, LogOut, Plus, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Brand } from "./Brand";
import styles from "./AppShell.module.css";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/campaigns/new", label: "Create New Campaign", icon: Plus },
  { href: "/campaigns/join", label: "Join Campaign", icon: UserPlus },
  { href: "/world-bible", label: "World Bible", icon: BookOpen },
];

export function AppShell({ children, campaignTitle, campaignStatus }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const displayName = profile?.displayName || "Adventurer";
  const avatar = profile?.photoURL ? null : displayName[0]?.toUpperCase() || "A";

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <button className={styles.menuButton} aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
          <Link href="/">
            <Brand compact />
          </Link>
        </div>
        <div className={styles.account}>
          <Bell size={21} />
          <button className={styles.avatarButton} type="button" onClick={logout} title="Sign out">
            {profile?.photoURL ? <img src={profile.photoURL} alt="" /> : <span className={styles.avatar}>{avatar}</span>}
          </button>
          <span>{displayName}</span>
          <LogOut size={16} />
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          {campaignTitle ? (
            <div className={styles.campaignMini}>
              <div className={styles.miniTop}>
                <strong>{campaignTitle}</strong>
                <span>...</span>
              </div>
              <p>
                <span className={styles.statusDot} /> {campaignStatus || "Active"}
              </p>
            </div>
          ) : null}

          <nav className={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={`${styles.navLink} ${active ? styles.active : ""}`}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
