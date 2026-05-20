"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTodoStore } from "@/lib/store";
import { isPast, isToday, differenceInHours } from "date-fns";

const NOTIFIED_KEY = "todo-notified-ids";
const CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes

function getNotifiedIds(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "{}");
  } catch {
    return {};
  }
}

function setNotifiedId(id: string) {
  const ids = getNotifiedIds();
  ids[id] = Date.now();
  // Prune entries older than 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const pruned = Object.fromEntries(
    Object.entries(ids).filter(([, ts]) => ts > cutoff),
  );
  pruned[id] = Date.now();
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(pruned));
}

export function NotificationHandler() {
  const { todos, fetchTodos } = useTodoStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRequestedPermission = useRef(false);

  const requestPermission = useCallback(async () => {
    if (hasRequestedPermission.current) return;
    hasRequestedPermission.current = true;
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const checkReminders = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const notified = getNotifiedIds();
    const now = new Date();

    const reminderTodos = todos.filter((todo) => {
      if (todo.completed || !todo.dueDate || todo.parentTodoId) return false;
      const dueDate = new Date(todo.dueDate);
      const isOverdue = isPast(dueDate) && !isToday(dueDate);
      const isDueToday = isToday(dueDate);
      const isDueSoon =
        !isOverdue && !isDueToday && differenceInHours(dueDate, now) <= 24;

      return isOverdue || isDueToday || isDueSoon;
    });

    for (const todo of reminderTodos) {
      if (notified[todo.id]) continue;

      const dueDate = new Date(todo.dueDate!);
      let body = "";

      if (isPast(dueDate) && !isToday(dueDate)) {
        body = "Overdue!";
      } else if (isToday(dueDate)) {
        body = "Due today";
      } else {
        body = "Due tomorrow";
      }

      const thing = useTodoStore
        .getState()
        .things.find((t) => t.id === todo.thingId);
      const title = thing ? `${thing.name}: ${todo.note}` : todo.note;

      try {
        new Notification(title, { body, tag: todo.id, icon: "/favicon.ico" });
        setNotifiedId(todo.id);
      } catch {
        // Notification failed silently
      }
    }
  }, [todos]);

  useEffect(() => {
    requestPermission();

    // Initial check after data loads
    const timeout = setTimeout(checkReminders, 3000);

    // Periodic check
    intervalRef.current = setInterval(() => {
      fetchTodos();
      setTimeout(checkReminders, 1000);
    }, CHECK_INTERVAL);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [requestPermission, checkReminders, fetchTodos]);

  // Re-check when todos change
  useEffect(() => {
    if (todos.length > 0) {
      const timeout = setTimeout(checkReminders, 500);
      return () => clearTimeout(timeout);
    }
  }, [todos, checkReminders]);

  return null;
}
