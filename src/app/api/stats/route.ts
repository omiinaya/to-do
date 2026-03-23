import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
