"use client";

import { useEffect, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCampaignRoom(campaignId) {
  const { user, firebaseReady } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(Boolean(firebaseReady));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseReady || !user || !campaignId) {
      setLoading(false);
      setError(firebaseReady ? "Sign in to load this campaign." : "Firebase is not configured.");
      return undefined;
    }

    setLoading(true);
    setError("");
    const db = getClientDb();
    const unsubs = [
      onSnapshot(
        doc(db, "campaigns", campaignId),
        (snapshot) => {
          if (snapshot.exists()) {
          const nextCampaign = { id: snapshot.id, ...snapshot.data() };
          setCampaign(nextCampaign);
          setPlayers(
            (nextCampaign.members || []).map((member) => ({
              id: member.uid,
              name: member.uid === user.uid ? `${member.displayName} (You)` : member.displayName,
              avatar: member.avatar || member.displayName?.[0] || "A",
              color: member.uid === nextCampaign.activeTurnUserId ? "purple" : "green",
              status: member.uid === nextCampaign.activeTurnUserId ? "Current Turn" : "Online",
            })),
          );
          } else {
            setCampaign(null);
            setPlayers([]);
            setError("Campaign not found or you do not have access.");
          }
          setLoading(false);
        },
        (err) => {
          setCampaign(null);
          setPlayers([]);
          setError(err.message || "Could not connect to campaign.");
          setLoading(false);
        }
      ),
      onSnapshot(
        query(collection(db, "campaigns", campaignId, "messages"), orderBy("timestamp", "asc"), limit(80)),
        (snapshot) => {
          setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          setMessages([]);
          setError(err.message || "Could not load campaign messages.");
        },
      ),
    ];

    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, [campaignId, firebaseReady, user]);

  return { campaign, messages, players, loading, error };
}
