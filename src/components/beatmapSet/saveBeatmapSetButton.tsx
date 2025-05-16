"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BeatmapSet } from "@/lib/osuApi";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { useSavedBeatmapSetsStore } from "../../stores/savedBeatmapSetsStore";
import { Button } from "../ui/button";

const SaveBeatmapSetButton = ({
  beatmapSet,
  alwaysShow,
}: {
  beatmapSet: BeatmapSet;
  alwaysShow?: boolean;
}) => {
  const savedEntries = useSavedBeatmapSetsStore.use.savedEntries();
  const addBeatmapSet = useSavedBeatmapSetsStore.use.addBeatmapSet();
  const removeBeatmapSet = useSavedBeatmapSetsStore.use.removeBeatmapSet();

  const isSaved =
    savedEntries[beatmapSet.id] && !savedEntries[beatmapSet.id].removedAt;

  const handleClick = () => {
    if (isSaved) {
      removeBeatmapSet(beatmapSet.id);
    } else {
      addBeatmapSet(beatmapSet);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 opacity-0 transition group-hover:opacity-100 focus:opacity-100",
              (isSaved || alwaysShow) && "opacity-100"
            )}
            onClick={handleClick}
          >
            <Bookmark
              className="size-5"
              fill={isSaved ? "white" : "transparent"}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isSaved ? "Unsave Beatmap" : "Save Beatmap"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SaveBeatmapSetButton;
