import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Things API - Use client-side store for now",
    endpoints: {
      "GET /api/things": "List all things",
      "POST /api/things": "Create a thing",
      "GET /api/things/:id": "Get a thing",
      "PUT /api/things/:id": "Update a thing",
      "DELETE /api/things/:id": "Delete a thing",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    message: "Thing creation endpoint - Use client-side store",
    data: body,
  });
}
