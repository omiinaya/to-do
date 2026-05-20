"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isPast,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useTodoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TodoItem } from "@/components/todos/TodoItem";

export default function CalendarPage() {
  const { todos, fetchAll } = useTodoStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      return isSameDay(new Date(todo.dueDate), date);
    });
  };

  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View todos by due date.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const dayTodos = getTodosForDate(day);
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasOverdue = dayTodos.some(
                  (t) =>
                    !t.completed &&
                    isPast(new Date(t.dueDate!)) &&
                    !isToday(new Date(t.dueDate!)),
                );

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "min-h-[80px] p-1 rounded-lg border text-left transition-colors",
                      isCurrentMonth ? "bg-card" : "bg-muted/30",
                      isSelected
                        ? "border-primary"
                        : "border-border hover:border-accent",
                      isToday(day) && "ring-2 ring-primary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday(day) && "text-primary",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayTodos.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayTodos.slice(0, 3).map((todo) => (
                          <div
                            key={todo.id}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate",
                              todo.completed
                                ? "bg-green-500/20 text-green-400 line-through"
                                : hasOverdue
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {todo.note}
                          </div>
                        ))}
                        {dayTodos.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayTodos.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Todos */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "EEEE, MMM d")
                : "Select a day"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateTodos.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} showThingName />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No todos due this day.
                </p>
              )
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Click a day to see todos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
