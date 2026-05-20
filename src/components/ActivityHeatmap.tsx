"use client";

import { useMemo } from "react";
import { format, subDays, startOfDay, endOfDay, getDay } from "date-fns";
import { ActivityLog } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  logs: ActivityLog[];
  days?: number;
}

export function ActivityHeatmap({ logs, days = 84 }: ActivityHeatmapProps) {
  const cells = useMemo(() => {
    const result: Array<{
      date: Date;
      count: number;
      level: number;
      dayOfWeek: number;
    }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = logs.filter(
        (log) =>
          log.action === "completed" &&
          new Date(log.timestamp) >= dayStart &&
          new Date(log.timestamp) <= dayEnd,
      ).length;

      let level = 0;
      if (count > 0) level = 1;
      if (count >= 3) level = 2;
      if (count >= 5) level = 3;
      if (count >= 8) level = 4;

      result.push({
        date,
        count,
        level,
        dayOfWeek: getDay(date),
      });
    }

    return result;
  }, [logs, days]);

  // Group into weeks
  const weeks: (typeof cells)[] = [];
  let currentWeek: typeof cells = [];

  cells.forEach((cell) => {
    if (cell.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const levelColors = [
    "bg-muted/50",
    "bg-green-900/60",
    "bg-green-700/70",
    "bg-green-500/80",
    "bg-green-400",
  ];

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-0.5">
        {/* Day labels row */}
        <div className="flex gap-0.5">
          <div className="w-8" />
          {weeks.map((_, wi) => (
            <div key={wi} className="w-3 h-3" />
          ))}
        </div>

        {/* Grid rows */}
        {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
          <div key={dayOfWeek} className="flex items-center gap-0.5">
            <div className="w-8 text-[10px] text-muted-foreground text-right pr-1.5">
              {dayOfWeek % 2 === 1 ? dayLabels[dayOfWeek] : ""}
            </div>
            {weeks.map((week, wi) => {
              const cell = week.find((c) => c.dayOfWeek === dayOfWeek);
              if (!cell) return <div key={wi} className="w-3 h-3" />;
              return (
                <div
                  key={wi}
                  title={`${format(cell.date, "MMM d")}: ${cell.count} completions`}
                  className={cn(
                    "w-3 h-3 rounded-[2px] transition-colors",
                    levelColors[cell.level],
                  )}
                />
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 ml-8">
          <span className="text-[10px] text-muted-foreground mr-1">Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={cn("w-3 h-3 rounded-[2px]", color)} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">More</span>
        </div>
      </div>
    </div>
  );
}
