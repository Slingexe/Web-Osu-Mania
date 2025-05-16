"use client";

import { Bookmark } from "lucide-react";
import { useSavedBeatmapSetsStore } from "../../stores/savedBeatmapSetsStore";
import CustomBeatmapSets from "./customBeatmapSets";

const SavedBeatmapSets = ({ className }: { className?: string }) => {
  const savedEntries = useSavedBeatmapSetsStore.use.savedEntries();
  const beatmapCache = useSavedBeatmapSetsStore.use.beatmapCache();

  const savedBeatmapSets = Object.values(savedEntries)
    .filter((entry) => !entry.removedAt)
    .map((entry) => beatmapCache[entry.id])
    .filter(Boolean);


  return (
    <CustomBeatmapSets
      label="Saved"
      helpText={
        <>
          Save beatmaps by clicking the <Bookmark className="inline" /> icon.
        </>
      }
      beatmapSets={savedBeatmapSets}
      className={className}
    />
  );
};

export default SavedBeatmapSets;
