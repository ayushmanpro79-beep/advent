"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCampaigns() {
  const { user, firebaseReady } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(Boolean(firebaseReady));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseReady || !user) {
      setCampaigns([]);
      setLoading(false);
      setError(firebaseReady ? "Sign in to load campaigns." : "Firebase is not configured.");
      return undefined;
    }

    setLoading(true);
    setError("");
    const db = getClientDb();
    const q = query(collection(db, "campaigns"), where("playerIds", "array-contains", user.uid));
    return onSnapshot(
      q,
      (snapshot) => {
        setCampaigns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setCampaigns([]);
        setError(err.message || "Could not load campaigns.");
        setLoading(false);
      },
    );
  }, [firebaseReady, user]);

  return { campaigns, loading, error, empty: !loading && !error && campaigns.length === 0 };
}
