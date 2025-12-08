"use client";

import { useCapacitorState } from "@/lib/capacitorPlatform";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

type CapacitorStatusIndicatorProps = {
  className?: string;
};

const CapacitorStatusIndicator = ({
  className,
}: CapacitorStatusIndicatorProps) => {
  const { isNative, platform } = useCapacitorState();

  return (
    <div className={cn("flex justify-center md:justify-start", className)}>
      <Badge
        variant={isNative ? "default" : "secondary"}
        className="gap-1 px-3 py-1 text-sm"
      >
        <span className="font-semibold">Capacitor:</span>
        <span>
          {isNative
            ? `${capitalizeFirstLetter(platform)} detected`
            : "Web (not detected)"}
        </span>
      </Badge>
    </div>
  );
};

export default CapacitorStatusIndicator;
