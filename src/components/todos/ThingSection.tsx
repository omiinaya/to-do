"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2, Copy, Check, CheckCircle2, Share2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TodoItem } from "./TodoItem";
import { useTodoStore } from "@/lib/store";
import { Thing, Todo } from "@/types";

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
  const [linkCopied, setLinkCopied] = useState(false);
  const { todos, deleteThing, updateThing } = useTodoStore();

  const thingTodos = todos.filter((t) => t.thingId === thing.id);
  const pendingTodos = thingTodos.filter((t) => !t.completed).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const completedTodos = thingTodos.filter((t) => t.completed).sort((a, b) => 
    new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()
  );
  const completedCount = completedTodos.length;
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

    const text = JSON.stringify(exportData, null, 2);

    try {
      // Try clipboard API first (requires HTTPS or localhost)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (HTTP over LAN)
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/things/${thing.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div
        onClick={() => !isEditing && setIsOpen(!isOpen)}
        className={isEditing ? "p-3" : "w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer"}
      >
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            {/* Main row: chevron, color, name, save */}
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: editColor }}
              />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") {
                    setEditName(thing.name);
                    setEditColor(thing.color);
                    setIsEditing(false);
                  }
                }}
                size={Math.max(editName.length + 2, 10)}
                className="px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
            {/* Color picker row */}
            <div className="flex gap-1.5 mt-2 ml-7">
              {THING_COLORS.map(color => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditColor(color);
                  }}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    editColor === color ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
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

            {/* Share Link Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink();
              }}
              title="Copy share link"
            >
              {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Link className="h-4 w-4" />}
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
                  handleCopyLink();
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {linkCopied ? "Link copied!" : "Share Link"}
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
        <div className="px-3 pb-3">
          {thingTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No todos yet. Add one above!
            </p>
          ) : (
            <div className="space-y-4">
              {/* Pending tasks */}
              {pendingTodos.length > 0 && (
                <div className="space-y-2">
                  {pendingTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                </div>
              )}

              {/* Completed tasks (collapsed) */}
              {completedTodos.length > 0 && (
                <CompletedSection todos={completedTodos} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompletedSection({ todos }: { todos: Todo[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-border pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full py-1"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <CheckCircle2 className="h-3 w-3 text-green-500" />
        <span>{todos.length} completed</span>
      </button>
      {isOpen && (
        <div className="space-y-2 mt-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
