'use client';

import { syncSavedToSupabase } from '@/stores/savedBeatmapSetsStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const SyncSavedBeatmapsButton = () => {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");

  const handleSync = async () => {
    try {
      setStatus("syncing");
      await syncSavedToSupabase();
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <Button onClick={handleSync} disabled={status === "syncing"}>
      {status === "idle" && "Sync Saved Beatmaps"}
      {status === "syncing" && "Syncing..."}
      {status === "done" && "Synced!"}
      {status === "error" && "Failed to Sync"}
    </Button>
  );
};
