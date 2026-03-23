import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await prisma.todo.findUnique({
    where: { id },
    include: { thing: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const newCompleted = !existing.completed;

  const todo = await prisma.todo.update({
    where: { id },
    data: {
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
    include: { thing: true },
  });

  await prisma.activityLog.create({
    data: {
      action: newCompleted ? "completed" : "uncompleted",
      entityType: "todo",
      entityId: todo.id,
      entityName: todo.note,
      thingId: todo.thingId,
      thingName: todo.thing?.name,
    },
  });

  return NextResponse.json({ success: true, data: todo });
}
