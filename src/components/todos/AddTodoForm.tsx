"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTodoStore } from "@/lib/store";
import { Priority } from "@/types";

interface AddTodoFormProps {
  onComplete?: () => void;
  defaultThing?: string;
}

export function AddTodoForm({ onComplete, defaultThing }: AddTodoFormProps) {
  const [thingName, setThingName] = useState(defaultThing || "");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { things, addTodo } = useTodoStore();
  const thingInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const suggestions =
    thingName.length > 0
      ? things.filter((t) =>
          t.name.toLowerCase().includes(thingName.toLowerCase()),
        )
      : [];

  const handleSubmit = async () => {
    const trimmedThing = thingName.trim();
    const trimmedNote = note.trim();

    if (trimmedThing && trimmedNote) {
      await addTodo(trimmedThing, trimmedNote, priority);
      setThingName("");
      setNote("");
      setPriority("medium");
      thingInputRef.current?.focus();
      onComplete?.();
    }
  };

  const selectThing = (name: string) => {
    setThingName(name);
    setShowSuggestions(false);
    noteInputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          id="quick-add-thing"
          ref={thingInputRef}
          type="text"
          placeholder="Thing name (e.g., Work, Groceries)"
          value={thingName}
          onChange={(e) => {
            setThingName(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (showSuggestions && suggestions.length > 0) {
                selectThing(suggestions[0].name);
              } else {
                noteInputRef.current?.focus();
              }
            }
            if (e.key === "Escape") {
              setShowSuggestions(false);
            }
          }}
          className="bg-muted/50"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-auto z-50">
            {suggestions.map((thing) => (
              <button
                key={thing.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectThing(thing.name)}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: thing.color }}
                />
                {thing.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        ref={noteInputRef}
        type="text"
        placeholder="What do you need to do?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="bg-muted/50"
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Priority:</span>
        {(["low", "medium", "high"] as Priority[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p)}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              priority === p
                ? p === "high"
                  ? "bg-red-500/20 text-red-400"
                  : p === "medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!thingName.trim() || !note.trim()}
        className="w-full"
      >
        Add Todo
      </Button>
    </div>
  );
}
