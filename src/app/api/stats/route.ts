import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Stats API - Use client-side store for now",
    endpoints: {
      "GET /api/stats": "Get overall statistics",
      "GET /api/stats/things": "Get per-thing statistics",
      "GET /api/stats/completion-trend": "Get completion trend data",
    },
  });
}
