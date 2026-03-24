import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const BACKUP_DIR = join(process.cwd(), "backups");

interface BackupData {
  version: number;
  things: Array<{ id: string; name: string; color: string; createdAt: string }>;
  todos: Array<{
    id: string;
    thingId: string;
    note: string;
    completed: boolean;
    priority: string;
    createdAt: string;
    completedAt: string | null;
    dueDate?: string | null;
    tags?: string;
    recurrence?: string | null;
    parentTodoId?: string | null;
  }>;
  logs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    entityName: string;
    thingId?: string;
    thingName?: string;
    timestamp: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();

    if (!filename || !filename.startsWith("backup-") || !filename.endsWith(".json")) {
      return NextResponse.json({ success: false, error: "Invalid filename" }, { status: 400 });
    }

    const filepath = join(BACKUP_DIR, filename);

    if (!existsSync(filepath)) {
      return NextResponse.json({ success: false, error: "Backup not found" }, { status: 404 });
    }

    const fileContent = readFileSync(filepath, "utf-8");
    const data: BackupData = JSON.parse(fileContent);

    if (!data.things || !data.todos) {
      return NextResponse.json({ success: false, error: "Invalid backup format" }, { status: 400 });
    }

    // Clear existing data
    await prisma.activityLog.deleteMany();
    await prisma.todo.deleteMany();
    await prisma.thing.deleteMany();

    // Import things
    for (const thing of data.things) {
      await prisma.thing.create({
        data: {
          id: thing.id,
          name: thing.name,
          color: thing.color,
          createdAt: new Date(thing.createdAt),
        },
      });
    }

    // Import todos
    for (const todo of data.todos) {
      await prisma.todo.create({
        data: {
          id: todo.id,
          thingId: todo.thingId,
          note: todo.note,
          completed: todo.completed,
          priority: todo.priority,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
          tags: todo.tags || "",
          recurrence: todo.recurrence || null,
          parentTodoId: todo.parentTodoId || null,
        },
      });
    }

    // Import logs
    if (data.logs) {
      for (const log of data.logs) {
        await prisma.activityLog.create({
          data: {
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            entityName: log.entityName,
            thingId: log.thingId,
            thingName: log.thingName,
            timestamp: new Date(log.timestamp),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Restored ${data.things.length} things and ${data.todos.length} todos from ${filename}`,
    });
  } catch (error) {
    console.error("Restore failed:", error);
    return NextResponse.json(
      { success: false, error: "Restore failed: " + (error as Error).message },
      { status: 500 }
    );
  }
}
