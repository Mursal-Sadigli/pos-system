"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("w-full bg-muted rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        className="h-full bg-primary"
        style={{ width: `${pct}%`, transition: "width 200ms ease-in-out" }}
      />
    </div>
  );
}

export default Progress;
