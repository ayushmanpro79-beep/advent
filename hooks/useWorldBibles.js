"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { getClientDb } from "@/lib/firebase/client";

export function useWorldBibles() {
  const { user, firebaseReady } = useAuth();
  const [worldBibles, setWorldBibles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(firebaseReady));

  useEffect(() => {
    if (!firebaseReady || !user) {
      setWorldBibles([]);
      setError(firebaseReady ? "Sign in to load world bibles." : "Firebase is not configured.");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");
    const db = getClientDb();
    const q = query(collection(db, "campaigns"), where("playerIds", "array-contains", user.uid));
    const worldUnsubs = [];

    const unsubscribeCampaigns = onSnapshot(
      q,
      (campaignSnapshot) => {
        worldUnsubs.splice(0).forEach((unsubscribe) => unsubscribe());
        const next = [];

        if (campaignSnapshot.empty) {
          setWorldBibles([]);
          setLoading(false);
        }

        campaignSnapshot.docs.forEach((campaignDoc) => {
          const campaign = { id: campaignDoc.id, ...campaignDoc.data() };
          const unsubscribe = onSnapshot(
            doc(db, "campaigns", campaignDoc.id, "worldBible", "current"),
            (snapshot) => {
              const data = snapshot.exists() ? snapshot.data() : {};
              const item = {
                id: campaignDoc.id,
                campaign: campaign.name,
                summary: data.summary || "No world bible has been written yet.",
                people: data.people || [],
                places: data.places || [],
                events: data.events || [],
                openThreads: data.openThreads || [],
              };
              const index = next.findIndex((entry) => entry.id === item.id);
              if (index >= 0) next[index] = item;
              else next.push(item);
              setWorldBibles([...next]);
              setLoading(false);
            },
            (err) => {
              setError(err.message || "Could not load world bible.");
              setLoading(false);
            },
          );
          worldUnsubs.push(unsubscribe);
        });
      },
      (err) => {
        setWorldBibles([]);
        setError(err.message || "Could not load campaigns for world bible.");
        setLoading(false);
      },
    );

    return () => {
      unsubscribeCampaigns();
      worldUnsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [firebaseReady, user]);

  return { worldBibles, loading, error, empty: !loading && !error && worldBibles.length === 0 };
}
