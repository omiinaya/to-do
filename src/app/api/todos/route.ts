import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const thingId = searchParams.get("thingId");
  const completed = searchParams.get("completed");
  const tag = searchParams.get("tag");
  const dueDate = searchParams.get("dueDate");
  const parentTodoId = searchParams.get("parentTodoId");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const dueBefore = searchParams.get("dueBefore");
  const dueAfter = searchParams.get("dueAfter");
  const priority = searchParams.get("priority");

  const where: Record<string, unknown> = {};
  if (thingId) where.thingId = thingId;
  if (completed !== null) where.completed = completed === "true";
  if (parentTodoId === "null") where.parentTodoId = null;
  else if (parentTodoId) where.parentTodoId = parentTodoId;
  if (tag) where.tags = { contains: tag };
  if (priority) where.priority = priority;
  if (search) where.note = { contains: search };
  if (dueDate) {
    const date = new Date(dueDate);
    where.dueDate = {
      gte: new Date(date.setHours(0, 0, 0, 0)),
      lte: new Date(date.setHours(23, 59, 59, 999)),
    };
  }
  if (dueBefore) {
    where.dueDate = {
      ...((where.dueDate as Record<string, unknown>) || {}),
      lte: new Date(dueBefore),
    };
  }
  if (dueAfter) {
    where.dueDate = {
      ...((where.dueDate as Record<string, unknown>) || {}),
      gte: new Date(dueAfter),
    };
  }

  const validSortFields = [
    "createdAt",
    "completedAt",
    "dueDate",
    "priority",
    "note",
  ];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [todos, total] = await Promise.all([
    prisma.todo.findMany({
      where,
      orderBy: [{ completed: "asc" }, { [sortField]: order }],
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
      include: {
        thing: true,
        subtasks: { include: { thing: true } },
      },
    }),
    prisma.todo.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: todos,
    meta: {
      total,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : 0,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const colors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
  ];

  // Find or create thing
  let thing = await prisma.thing.findFirst({
    where: { name: body.thingName },
  });

  if (!thing) {
    const count = await prisma.thing.count();
    thing = await prisma.thing.create({
      data: {
        name: body.thingName,
        color: colors[count % colors.length],
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "created",
        entityType: "thing",
        entityId: thing.id,
        entityName: thing.name,
        thingId: thing.id,
        thingName: thing.name,
      },
    });
  }

  const todo = await prisma.todo.create({
    data: {
      thingId: thing.id,
      note: body.note,
      priority: body.priority || "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      tags: body.tags || "",
      recurrence: body.recurrence || null,
      parentTodoId: body.parentTodoId || null,
    },
    include: { thing: true, subtasks: true },
  });

  await prisma.activityLog.create({
    data: {
      action: "created",
      entityType: "todo",
      entityId: todo.id,
      entityName: todo.note,
      thingId: thing.id,
      thingName: thing.name,
    },
  });

  return NextResponse.json({ success: true, data: todo });
}
