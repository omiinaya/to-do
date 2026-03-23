import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ImportThing {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
}

interface ImportTodo {
  id: string;
  thingId: string;
  note: string;
  completed: boolean;
  priority: string;
  createdAt?: string;
  completedAt?: string | null;
}

interface ImportLog {
  id?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  thingId?: string;
  thingName?: string;
  timestamp?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate basic structure
    if (!body.things || !body.todos) {
      return NextResponse.json(
        { success: false, error: "Invalid format: missing things or todos" },
        { status: 400 }
      );
    }

    // Clear existing data
    await prisma.activityLog.deleteMany();
    await prisma.todo.deleteMany();
    await prisma.thing.deleteMany();

    // Build old ID to new ID mapping
    const idMap = new Map<string, string>();

    // Import things
    for (const oldThing of body.things as ImportThing[]) {
      const thing = await prisma.thing.create({
        data: {
          name: oldThing.name,
          color: oldThing.color || "#3b82f6",
          createdAt: oldThing.createdAt ? new Date(oldThing.createdAt) : new Date(),
        },
      });
      idMap.set(oldThing.id, thing.id);
    }

    // Import todos
    for (const oldTodo of body.todos as ImportTodo[]) {
      const newThingId = idMap.get(oldTodo.thingId);
      if (!newThingId) continue;

      await prisma.todo.create({
        data: {
          id: oldTodo.id,
          thingId: newThingId,
          note: oldTodo.note,
          completed: oldTodo.completed,
          priority: oldTodo.priority || "medium",
          createdAt: oldTodo.createdAt ? new Date(oldTodo.createdAt) : new Date(),
          completedAt: oldTodo.completedAt ? new Date(oldTodo.completedAt) : null,
        },
      });
    }

    // Import logs (optional)
    if (body.logs && Array.isArray(body.logs)) {
      for (const oldLog of body.logs as ImportLog[]) {
        const newThingId = oldLog.thingId ? idMap.get(oldLog.thingId) : null;

        await prisma.activityLog.create({
          data: {
            action: oldLog.action,
            entityType: oldLog.entityType,
            entityId: oldLog.entityId,
            entityName: oldLog.entityName,
            thingId: newThingId,
            thingName: oldLog.thingName,
            timestamp: oldLog.timestamp ? new Date(oldLog.timestamp) : new Date(),
          },
        });
      }
    }

    const thingsCount = await prisma.thing.count();
    const todosCount = await prisma.todo.count();
    const logsCount = await prisma.activityLog.count();

    return NextResponse.json({
      success: true,
      message: `Imported ${thingsCount} things, ${todosCount} todos, ${logsCount} logs`,
    });
  } catch (error) {
    console.error("Import failed:", error);
    return NextResponse.json(
      { success: false, error: "Import failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}
