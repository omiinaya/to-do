import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const thingId = searchParams.get("thingId");
  const action = searchParams.get("action");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (thingId) where.thingId = thingId;
  if (action) where.action = action;
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, unknown>).gte = new Date(from);
    if (to) (where.timestamp as Record<string, unknown>).lte = new Date(to);
  }

  const take = limit ? parseInt(limit) : 500;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take,
      skip: offset ? parseInt(offset) : undefined,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: logs,
    meta: { total, limit: take, offset: offset ? parseInt(offset) : 0 },
  });
}
