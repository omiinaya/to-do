import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Logs API - Use client-side store for now",
    endpoints: {
      "GET /api/logs": "List activity logs",
      "GET /api/logs?thingId=:id": "Filter by thing",
      "GET /api/logs?action=completed": "Filter by action",
    },
  });
}
