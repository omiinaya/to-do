import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const thing = await prisma.thing.findUnique({
    where: { id },
    include: { todos: { orderBy: { createdAt: "desc" } } },
  });

  if (!thing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: thing });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const thing = await prisma.thing.update({
    where: { id },
    data: {
      name: body.name,
      color: body.color,
    },
  });

  return NextResponse.json({ success: true, data: thing });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const thing = await prisma.thing.findUnique({ where: { id } });

  if (thing) {
    await prisma.activityLog.create({
      data: {
        action: "deleted",
        entityType: "thing",
        entityId: thing.id,
        entityName: thing.name,
        thingId: thing.id,
        thingName: thing.name,
      },
    });
  }

  await prisma.thing.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
