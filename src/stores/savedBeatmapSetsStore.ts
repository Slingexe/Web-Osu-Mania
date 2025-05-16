import { supabase } from '@/lib/auth/client';
import { BeatmapSet, getBeatmap } from "@/lib/osuApi";
import { createSelectors, getLocalStorageConfig } from "@/lib/zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type BeatmapSaveEntry = {
  id: number;
  savedAt: number;
  removedAt?: number;
};

type SavedBeatmapSetsState = {
  beatmapCache: Record<number, BeatmapSet>; // Local cache
  savedEntries: Record<number, BeatmapSaveEntry>; // ID list with timestamps

  addBeatmapSet: (beatmapSet: BeatmapSet) => void;
  removeBeatmapSet: (id: number) => void;
};

function migrateCallback(data: BeatmapSet[]): Partial<SavedBeatmapSetsState> {
  const now = Date.now();
  return {
    beatmapCache: Object.fromEntries(data.map((b) => [b.id, b])),
    savedEntries: Object.fromEntries(data.map((b) => [b.id, { id: b.id, savedAt: now }]))
  };
}

const useSavedBeatmapSetsStoreBase = create<SavedBeatmapSetsState>()(
  persist(
    immer((set, get) => ({
      beatmapCache: {},
      savedEntries: {},

      addBeatmapSet: async (beatmapSet) => {
        const now = Date.now();

        set((state) => {
          state.beatmapCache[beatmapSet.id] = beatmapSet;
          state.savedEntries[beatmapSet.id] = {
            id: beatmapSet.id,
            savedAt: now,
            removedAt: undefined,
          };
        });
      
        const { savedEntries } = get();
        const savedJson = Object.values(savedEntries)
          .filter((entry) => !entry.removedAt || entry.savedAt > entry.removedAt)
          .map((entry) => ({
            id: entry.id,
            savedAt: entry.savedAt,
            removedAt: entry.removedAt ?? null,
          }));
        
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (!user) return;
        
        await supabase
          .from("data")
          .upsert({ uuid: user.id, saved: savedJson }, { onConflict: "uuid" });
      },

      removeBeatmapSet: async (id) => {
        const now = Date.now();
      
        set((state) => {
          if (state.savedEntries[id]) {
            state.savedEntries[id].removedAt = now;
          }
        });
      
        const { savedEntries } = get();
        const savedJson = Object.values(savedEntries)
          .filter((entry) => !entry.removedAt || entry.savedAt > entry.removedAt)
          .map((entry) => ({
            id: entry.id,
            savedAt: entry.savedAt,
            removedAt: entry.removedAt ?? null,
          }));
        
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (!user) return;
        
        await supabase
          .from("data")
          .upsert({ uuid: user.id, saved: savedJson }, { onConflict: "uuid" });
      },

    })),
    {
      name: "savedBeatmapSets",
      storage: getLocalStorageConfig({ migrateCallback })
    }
  )
);

// Merge and fetch data on login
const loadSavedBeatmaps = async (userId: string) => {
  const { data, error } = await supabase
    .from("data")
    .select("saved")
    .eq("uuid", userId)
    .single();

  if (!error && data?.saved) {
    const supabaseEntries: BeatmapSaveEntry[] = data.saved;
    const store = useSavedBeatmapSetsStoreBase.getState();

    const merged: Record<number, BeatmapSaveEntry> = { ...store.savedEntries };
    const cache = { ...store.beatmapCache };

    for (const entry of supabaseEntries) {
      const local = merged[entry.id];

      if (
        !local ||
        (local.removedAt && entry.savedAt > local.removedAt) ||
        (local.savedAt < entry.savedAt)
      ) {
        merged[entry.id] = {
          id: entry.id,
          savedAt: entry.savedAt,
          removedAt: entry.removedAt ?? undefined,
        };

        if (!cache[entry.id]) {
          try {
            const beatmap = await getBeatmap(entry.id);
            cache[entry.id] = beatmap;
          } catch (_) {
            // skip fetch failures
          }
        }
      }
    }

    useSavedBeatmapSetsStoreBase.setState((state) => {
      state.savedEntries = merged;
      state.beatmapCache = cache;
    });
  }

  if (error && error.code === "PGRST116") {
    await supabase.from("data").insert({ uuid: userId, saved: [] });
  }
};

(async () => {
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  if (user) await loadSavedBeatmaps(user.id);
})();

supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) await loadSavedBeatmaps(session.user.id);
});

export const useSavedBeatmapSetsStore = createSelectors(
  useSavedBeatmapSetsStoreBase
);

export const syncSavedToSupabase = async () => {
  const { savedEntries } = useSavedBeatmapSetsStoreBase.getState();
  const savedIds = Object.values(savedEntries)
    .filter((entry) => !entry.removedAt)
    .map((entry) => entry.id);

  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return;

  await supabase
    .from("data")
    .upsert({ uuid: user.id, saved: savedIds }, { onConflict: "uuid" });
};
