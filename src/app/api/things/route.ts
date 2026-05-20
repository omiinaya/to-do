import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const things = await prisma.thing.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ success: true, data: things });
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

  const allThings = await prisma.thing.findMany();
  const existing = allThings.find(
    (t) => t.name.toLowerCase() === body.name.toLowerCase(),
  );

  if (existing) {
    return NextResponse.json({ success: true, data: existing });
  }

  const thing = await prisma.thing.create({
    data: {
      name: body.name,
      color: body.color || colors[allThings.length % colors.length],
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

  return NextResponse.json({ success: true, data: thing });
}
