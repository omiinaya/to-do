"use client";

import { useState } from "react";
import { format, isPast, isToday } from "date-fns";
import {
  Trash2,
  Pencil,
  Check,
  Calendar,
  Tag,
  Repeat,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTodoStore } from "@/lib/store";
import { Todo, Priority, Recurrence } from "@/types";

interface TodoItemProps {
  todo: Todo;
  showThingName?: boolean;
}

export function TodoItem({ todo, showThingName = false }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(todo.note);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : "",
  );
  const [editTags, setEditTags] = useState(todo.tags || "");
  const [editRecurrence, setEditRecurrence] = useState<Recurrence | "">(
    todo.recurrence || "",
  );
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const { toggleTodo, deleteTodo, updateTodo, addTodo, things } =
    useTodoStore();

  const thing = things.find((t) => t.id === todo.thingId);
  const tags = todo.tags ? todo.tags.split(",").filter((t) => t.trim()) : [];
  const subtasks = todo.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const priorityTextColors: Record<Priority, string> = {
    low: "text-green-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  const getDueDateColor = () => {
    if (!todo.dueDate) return "";
    const date = new Date(todo.dueDate);
    if (todo.completed) return "text-muted-foreground";
    if (isPast(date) && !isToday(date)) return "text-red-400";
    if (isToday(date)) return "text-yellow-400";
    return "text-muted-foreground";
  };

  const handleSaveEdit = async () => {
    if (editNote.trim()) {
      await updateTodo(todo.id, editNote.trim(), editPriority, {
        dueDate: editDueDate || null,
        tags: editTags,
        recurrence: editRecurrence || null,
      });
    }
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditNote(todo.note);
    setEditPriority(todo.priority);
    setEditDueDate(
      todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : "",
    );
    setEditTags(todo.tags || "");
    setEditRecurrence(todo.recurrence || "");
    setIsEditing(true);
  };

  const handleAddSubtask = async () => {
    if (newSubtask.trim() && thing) {
      await addTodo(thing.name, newSubtask.trim(), todo.priority, {
        parentTodoId: todo.id,
      });
      setNewSubtask("");
    }
  };

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "group flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card transition-all hover:border-accent",
          todo.completed && "opacity-60",
          isEditing && "border-primary/50",
        )}
      >
        {/* Checkbox */}
        <Checkbox
          checked={todo.completed}
          onCheckedChange={async () => await toggleTodo(todo.id)}
          className="shrink-0"
        />

        {/* Expand subtasks button */}
        {subtasks.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            {showSubtasks ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

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
            <div>
              <p
                className={cn(
                  "text-sm truncate",
                  todo.completed && "line-through text-muted-foreground",
                )}
              >
                {todo.note}
              </p>
              {/* Tags */}
              {tags.length > 0 && !isEditing && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs px-1.5 py-0"
                    >
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: priority + date + recurrence */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className={cn(
                  "text-xs rounded-md px-2 py-0.5 bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
                  priorityTextColors[editPriority],
                )}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="text-xs px-2 py-0.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tags..."
                className="w-20 text-xs px-2 py-0.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={editRecurrence}
                onChange={(e) =>
                  setEditRecurrence(e.target.value as Recurrence | "")
                }
                className="text-xs px-2 py-0.5 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">no repeat</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
              </select>
            </>
          ) : (
            <>
              {todo.recurrence && (
                <Repeat className="h-3.5 w-3.5 text-blue-400" />
              )}
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs bg-muted",
                  priorityTextColors[todo.priority],
                )}
              >
                {todo.priority}
              </Badge>
              {todo.dueDate && (
                <span
                  className={cn(
                    "text-xs flex items-center gap-1",
                    getDueDateColor(),
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {format(new Date(todo.dueDate), "MMM d")}
                </span>
              )}
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}
            </>
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

      {/* Subtasks */}
      {(showSubtasks || isEditing) && (
        <div className="ml-8 space-y-1">
          {subtasks.map((subtask) => (
            <TodoItem key={subtask.id} todo={subtask} />
          ))}
          {/* Add subtask input */}
          <div className="flex items-center gap-2 p-2">
            <Checkbox disabled className="opacity-30" />
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSubtask.trim()) {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="Add subtask..."
              className="flex-1 px-2 py-1 text-xs bg-transparent border-b border-input focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
