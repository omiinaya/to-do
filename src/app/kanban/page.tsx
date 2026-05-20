"use client";

import { useState, useEffect } from "react";
import { format, isPast, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTodoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Calendar, Tag, Repeat, LayoutGrid } from "lucide-react";
import { Todo } from "@/types";

type Column = "backlog" | "today" | "upcoming" | "done";

export default function KanbanPage() {
  const { things, todos, toggleTodo, fetchAll } = useTodoStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getColumns = (): Record<Column, Todo[]> => {
    const columns: Record<Column, Todo[]> = {
      backlog: [],
      today: [],
      upcoming: [],
      done: [],
    };

    todos.forEach((todo) => {
      if (todo.completed) {
        columns.done.push(todo);
      } else if (!todo.dueDate) {
        columns.backlog.push(todo);
      } else if (isToday(new Date(todo.dueDate))) {
        columns.today.push(todo);
      } else if (isPast(new Date(todo.dueDate))) {
        columns.backlog.push(todo); // Overdue goes to backlog
      } else {
        columns.upcoming.push(todo);
      }
    });

    return columns;
  };

  const columns = getColumns();

  const columnConfig: { key: Column; title: string; color: string }[] = [
    { key: "backlog", title: "Backlog", color: "text-muted-foreground" },
    { key: "today", title: "Today", color: "text-yellow-400" },
    { key: "upcoming", title: "Upcoming", color: "text-blue-400" },
    { key: "done", title: "Done", color: "text-green-400" },
  ];

  const getDueDateColor = (todo: Todo) => {
    if (!todo.dueDate) return "";
    const date = new Date(todo.dueDate);
    if (todo.completed) return "text-muted-foreground";
    if (isPast(date) && !isToday(date)) return "text-red-400";
    if (isToday(date)) return "text-yellow-400";
    return "text-muted-foreground";
  };

  const priorityColors = {
    low: "border-l-green-500",
    medium: "border-l-yellow-500",
    high: "border-l-red-500",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">
          Visual board view of your todos.
        </p>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columnConfig.map(({ key, title, color }) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2
                className={cn("font-semibold flex items-center gap-2", color)}
              >
                <LayoutGrid className="h-4 w-4" />
                {title}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {columns[key].length}
              </Badge>
            </div>

            <div className="space-y-2 min-h-[200px]">
              {columns[key].map((todo) => {
                const thing = things.find((t) => t.id === todo.thingId);
                const tags = todo.tags
                  ? todo.tags.split(",").filter((t) => t.trim())
                  : [];

                return (
                  <Card
                    key={todo.id}
                    className={cn(
                      "border-l-4 cursor-pointer hover:border-accent transition-colors",
                      priorityColors[todo.priority],
                      todo.completed && "opacity-60",
                    )}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm",
                              todo.completed &&
                                "line-through text-muted-foreground",
                            )}
                          >
                            {todo.note}
                          </p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 flex-wrap pl-6">
                        {thing && (
                          <Badge variant="outline" className="text-xs">
                            <div
                              className="w-2 h-2 rounded-full mr-1"
                              style={{ backgroundColor: thing.color }}
                            />
                            {thing.name}
                          </Badge>
                        )}
                        {todo.dueDate && (
                          <span
                            className={cn(
                              "text-xs flex items-center gap-1",
                              getDueDateColor(todo),
                            )}
                          >
                            <Calendar className="h-3 w-3" />
                            {format(new Date(todo.dueDate), "MMM d")}
                          </span>
                        )}
                        {todo.recurrence && (
                          <Repeat className="h-3 w-3 text-blue-400" />
                        )}
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap pl-6">
                          {tags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs px-1.5 py-0"
                            >
                              <Tag className="h-2.5 w-2.5 mr-1" />
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {columns[key].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No todos
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
