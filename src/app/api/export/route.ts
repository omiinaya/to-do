import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const things = await prisma.thing.findMany();
  const todos = await prisma.todo.findMany();
  const logs = await prisma.activityLog.findMany();

  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    things,
    todos,
    logs,
  };

  return NextResponse.json(data);
}
