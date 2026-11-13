"use client";

import { useEffect, useState } from "react";
import { searchUserByIdApi } from "@/api/user.api";

// Shared across the app for the session, so each person is fetched once.
const cache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<void>>();

const load = (id: string) => {
  if (cache.has(id) || inFlight.has(id)) return inFlight.get(id) ?? Promise.resolve();
  const p = searchUserByIdApi(id)
    .then((res) => {
      cache.set(id, res?.data?.searchedUser?.avatar?.url ?? null);
    })
    .catch(() => {
      cache.set(id, null);
    })
    .finally(() => inFlight.delete(id));
  inFlight.set(id, p);
  return p;
};

/** Profile pictures for a list of user ids (Mumble senders don't include them). */
export function useUserAvatars(ids: (string | null | undefined)[]) {
  const key = Array.from(new Set(ids.filter(Boolean) as string[])).sort().join(",");
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const unique = key ? key.split(",") : [];
    if (unique.length === 0) return;
    let cancelled = false;
    const sync = () => {
      if (cancelled) return;
      const next: Record<string, string | null> = {};
      unique.forEach((id) => {
        if (cache.has(id)) next[id] = cache.get(id) ?? null;
      });
      setAvatars(next);
    };
    sync();
    Promise.all(unique.map(load)).then(sync);
    return () => {
      cancelled = true;
    };
  }, [key]);

  return avatars;
}
