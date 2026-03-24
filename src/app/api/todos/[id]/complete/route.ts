import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, addWeeks, addMonths } from "date-fns";

function getNextDueDate(currentDueDate: Date | null, recurrence: string | null): Date | null {
  if (!recurrence) return null;
  const base = currentDueDate || new Date();
  switch (recurrence) {
    case "daily":
      return addDays(base, 1);
    case "weekly":
      return addWeeks(base, 1);
    case "monthly":
      return addMonths(base, 1);
    default:
      return null;
  }
}

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

  // Auto-create next recurring todo when completing
  if (newCompleted && todo.recurrence) {
    const nextDueDate = getNextDueDate(todo.dueDate, todo.recurrence);

    await prisma.todo.create({
      data: {
        thingId: todo.thingId,
        note: todo.note,
        priority: todo.priority,
        dueDate: nextDueDate,
        tags: todo.tags,
        recurrence: todo.recurrence,
        parentTodoId: todo.parentTodoId,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "created",
        entityType: "todo",
        entityId: "recurring",
        entityName: `${todo.note} (next occurrence)`,
        thingId: todo.thingId,
        thingName: todo.thing?.name,
      },
    });
  }

  return NextResponse.json({ success: true, data: todo });
}
