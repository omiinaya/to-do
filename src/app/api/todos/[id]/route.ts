import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const todo = await prisma.todo.findUnique({
    where: { id },
    include: { thing: true },
  });

  if (!todo) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: todo });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.note !== undefined) data.note = body.note;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.dueDate !== undefined)
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.tags !== undefined) data.tags = body.tags;
  if (body.recurrence !== undefined) data.recurrence = body.recurrence || null;

  const todo = await prisma.todo.update({
    where: { id },
    data,
    include: { thing: true },
  });

  return NextResponse.json({ success: true, data: todo });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const todo = await prisma.todo.findUnique({
    where: { id },
    include: { thing: true },
  });

  if (todo) {
    await prisma.activityLog.create({
      data: {
        action: "deleted",
        entityType: "todo",
        entityId: todo.id,
        entityName: todo.note,
        thingId: todo.thingId,
        thingName: todo.thing?.name,
      },
    });
  }

  await prisma.todo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
