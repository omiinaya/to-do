import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const thingId = searchParams.get("thingId");
  const action = searchParams.get("action");
  const limit = searchParams.get("limit");

  const where: Record<string, unknown> = {};
  if (thingId) where.thingId = thingId;
  if (action) where.action = action;

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit ? parseInt(limit) : 500,
  });

  return NextResponse.json({ success: true, data: logs });
}
