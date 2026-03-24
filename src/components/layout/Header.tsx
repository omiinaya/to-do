"use client";

import { useState, useEffect } from "react";
import { Search, Menu, Moon, Sun, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTodoStore } from "@/lib/store";
import { startOfDay, endOfDay, subDays } from "date-fns";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(true);
  const { todos, things, logs, fetchAll } = useTodoStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const searchResults = searchQuery
    ? todos.filter((todo) =>
        todo.note.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const hasCompletion = logs.some(
        (log) =>
          log.action === "completed" &&
          new Date(log.timestamp) >= dayStart &&
          new Date(log.timestamp) <= dayEnd
      );

      if (hasCompletion) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => {
            const sidebar = document.getElementById("mobile-sidebar");
            sidebar?.classList.toggle("hidden");
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Spacer to push search to center */}
        <div className="flex-1 md:flex-none md:w-64" />

        {/* Search - centered */}
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="global-search"
            type="search"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50"
          />
          
          {/* Search Results Dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto z-50">
              {searchResults.slice(0, 5).map((todo) => {
                const thing = things.find((t) => t.id === todo.thingId);
                return (
                  <div
                    key={todo.id}
                    className="px-3 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-0"
                  >
                    <p className="text-sm truncate">{todo.note}</p>
                    {thing && (
                      <p className="text-xs text-muted-foreground">
                        {thing.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex-1 md:flex-none md:w-64 flex justify-end items-center gap-2">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10">
            <Flame className={`h-4 w-4 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            <span className={`text-sm font-medium ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
              {streak}
            </span>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
