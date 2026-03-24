"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TodoItem } from "./TodoItem";
import { useTodoStore } from "@/lib/store";
import { Thing } from "@/types";

const THING_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#14b8a6', // teal
];

interface ThingSectionProps {
  thing: Thing;
  defaultOpen?: boolean;
}

export function ThingSection({ thing, defaultOpen = true }: ThingSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(thing.name);
  const [editColor, setEditColor] = useState(thing.color);
  const [copied, setCopied] = useState(false);
  const { todos, deleteThing, updateThing } = useTodoStore();

  const thingTodos = todos.filter((t) => t.thingId === thing.id);
  const completedCount = thingTodos.filter((t) => t.completed).length;
  const totalCount = thingTodos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSaveEdit = async () => {
    if (editName.trim()) {
      await updateThing(thing.id, editName.trim(), editColor);
    }
    setIsEditing(false);
  };

  const handleCopyJson = async () => {
    const exportData = thingTodos.map(todo => ({
      note: todo.note,
      completed: todo.completed,
      priority: todo.priority,
      dueDate: todo.dueDate,
      tags: todo.tags,
      createdAt: todo.createdAt,
      completedAt: todo.completedAt,
    }));

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div
        onClick={() => !isEditing && setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {THING_COLORS.map(color => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditColor(color);
                  }}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    editColor === color ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") {
                  setEditName(thing.name);
                  setEditColor(thing.color);
                  setIsEditing(false);
                }
              }}
              className="px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring w-32"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-500"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveEdit();
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
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
                style={{ width: progress + "%" }}
              />
            </div>

            {/* Copy JSON Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyJson();
              }}
              title="Copy as JSON"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditName(thing.name);
                  setEditColor(thing.color);
                  setIsEditing(true);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleCopyJson();
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${thing.name}" and all its todos?`)) {
                      await deleteThing(thing.id);
                    }
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
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
