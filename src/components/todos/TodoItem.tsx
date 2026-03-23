"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTodoStore } from "@/lib/store";
import { Todo, Priority } from "@/types";

interface TodoItemProps {
  todo: Todo;
  showThingName?: boolean;
}

export function TodoItem({ todo, showThingName = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(todo.note);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const { toggleTodo, deleteTodo, updateTodo, things } = useTodoStore();

  const thing = things.find((t) => t.id === todo.thingId);

  const priorityTextColors: Record<Priority, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  const handleSaveEdit = async () => {
    if (editNote.trim()) {
      await updateTodo(todo.id, editNote.trim(), editPriority);
    }
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditNote(todo.note);
    setEditPriority(todo.priority);
    setIsEditing(true);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card transition-all hover:border-accent",
        todo.completed && "opacity-60",
        isEditing && "border-primary/50"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={todo.completed}
        onCheckedChange={async () => await toggleTodo(todo.id)}
        className="shrink-0"
      />

      {/* Thing badge if showing */}
      {showThingName && thing && (
        <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
          <div
            className="w-2 h-2 rounded-full mr-1.5"
            style={{ backgroundColor: thing.color }}
          />
          {thing.name}
        </Badge>
      )}

      {/* Note */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === "Escape") setIsEditing(false);
            }}
            className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        ) : (
          <p
            className={cn(
              "text-sm truncate",
              todo.completed && "line-through text-muted-foreground"
            )}
          >
            {todo.note}
          </p>
        )}
      </div>

      {/* Right side: priority + date */}
      <div className="flex items-center gap-2 shrink-0">
        {isEditing ? (
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className={cn(
              "text-xs rounded-md px-2 py-0.5 bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
              priorityTextColors[editPriority]
            )}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        ) : (
          <Badge variant="secondary" className={cn("text-xs bg-muted", priorityTextColors[todo.priority])}>
            {todo.priority}
          </Badge>
        )}

        <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
          {format(new Date(todo.createdAt), "MMM d, yyyy")}
        </span>

        {todo.completed && todo.completedAt && (
          <span className="text-xs text-green-400 whitespace-nowrap">
            ✓
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
            onClick={handleSaveEdit}
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleStartEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={async () => await deleteTodo(todo.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
