"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TodoItem } from "./TodoItem";
import { useTodoStore } from "@/lib/store";
import { Thing } from "@/types";

interface ThingSectionProps {
  thing: Thing;
  defaultOpen?: boolean;
}

export function ThingSection({ thing, defaultOpen = true }: ThingSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { todos, deleteThing } = useTodoStore();

  const thingTodos = todos.filter((t) => t.thingId === thing.id);
  const completedCount = thingTodos.filter((t) => t.completed).length;
  const totalCount = thingTodos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: thing.color }}
        />
        
        <span className="font-medium flex-1 text-left">{thing.name}</span>
        
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount}
        </span>

        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-destructive"
          onClick={async (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${thing.name}" and all its todos?`)) {
              await deleteThing(thing.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Todo List */}
      {isOpen && (
        <div className="px-3 pb-3 space-y-2">
          {thingTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No todos yet. Add one above!
            </p>
          ) : (
            thingTodos
              .sort((a, b) => {
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((todo) => <TodoItem key={todo.id} todo={todo} />)
          )}
        </div>
      )}
    </div>
  );
}
