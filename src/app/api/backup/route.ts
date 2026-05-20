import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  existsSync,
} from "fs";
import { join } from "path";

const BACKUP_DIR = join(process.cwd(), "backups");
const MAX_BACKUPS = 30;

export async function POST() {
  try {
    // Create backup directory if it doesn't exist
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Fetch all data
    const things = await prisma.thing.findMany();
    const todos = await prisma.todo.findMany();
    const logs = await prisma.activityLog.findMany();

    const backup = {
      version: 2,
      createdAt: new Date().toISOString(),
      things,
      todos,
      logs,
    };

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.json`;
    const filepath = join(BACKUP_DIR, filename);

    // Write backup file
    writeFileSync(filepath, JSON.stringify(backup, null, 2));

    // Clean up old backups (keep only MAX_BACKUPS)
    const files = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    if (files.length > MAX_BACKUPS) {
      const filesToDelete = files.slice(0, files.length - MAX_BACKUPS);
      for (const file of filesToDelete) {
        unlinkSync(join(BACKUP_DIR, file));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Backup created: ${filename}`,
      backupsRemaining: Math.min(files.length, MAX_BACKUPS),
    });
  } catch (error) {
    console.error("Backup failed:", error);
    return NextResponse.json(
      { success: false, error: "Backup failed: " + (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    if (!existsSync(BACKUP_DIR)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const files = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort((a, b) => b.localeCompare(a))
      .reverse();

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to list backups" },
      { status: 500 },
    );
  }
}
