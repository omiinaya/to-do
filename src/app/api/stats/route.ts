import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const days = parseInt(searchParams.get("days") || "7");

  if (type === "completion-trend") {
    const logs = await prisma.activityLog.findMany({
      where: { action: "completed" },
      orderBy: { timestamp: "desc" },
    });

    const todos = await prisma.todo.findMany({
      select: { createdAt: true },
    });

    const trend = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const completed = logs.filter(
        (log) =>
          new Date(log.timestamp) >= dayStart &&
          new Date(log.timestamp) <= dayEnd
      ).length;

      const created = todos.filter(
        (todo) =>
          new Date(todo.createdAt) >= dayStart &&
          new Date(todo.createdAt) <= dayEnd
      ).length;

      return { date: format(date, "yyyy-MM-dd"), completed, created };
    });

    return NextResponse.json({ success: true, data: trend });
  }

  if (type === "activity-heatmap") {
    const heatmapDays = parseInt(searchParams.get("heatmapDays") || "84");
    const logs = await prisma.activityLog.findMany({
      where: { action: "completed" },
      orderBy: { timestamp: "desc" },
    });

    const heatmap = Array.from({ length: heatmapDays }, (_, i) => {
      const date = subDays(new Date(), heatmapDays - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = logs.filter(
        (log) =>
          new Date(log.timestamp) >= dayStart &&
          new Date(log.timestamp) <= dayEnd
      ).length;

      return { date: format(date, "yyyy-MM-dd"), count };
    });

    return NextResponse.json({ success: true, data: heatmap });
  }

  // Default: overall stats
  const things = await prisma.thing.findMany({
    include: { todos: true },
  });

  const totalThings = things.length;
  const totalTodos = await prisma.todo.count();
  const completedTodos = await prisma.todo.count({ where: { completed: true } });
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const thingsStats = things.map((thing) => {
    const total = thing.todos.length;
    const completed = thing.todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    return {
      thing: { id: thing.id, name: thing.name, color: thing.color },
      total,
      completed,
      pending,
      rate,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      totalThings,
      totalTodos,
      completedTodos,
      pendingTodos,
      completionRate,
      thingsStats,
    },
  });
}
