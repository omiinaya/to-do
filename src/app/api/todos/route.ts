import { NextResponse } from "next/server";

// This is a placeholder API route
// In a real implementation, this would connect to a database
// For now, the app uses client-side localStorage via Zustand

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Todos API - Use client-side store for now",
    endpoints: {
      "GET /api/todos": "List all todos",
      "POST /api/todos": "Create a todo",
      "GET /api/todos/:id": "Get a todo",
      "PUT /api/todos/:id": "Update a todo",
      "PATCH /api/todos/:id/complete": "Toggle todo completion",
      "DELETE /api/todos/:id": "Delete a todo",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    message: "Todo creation endpoint - Use client-side store",
    data: body,
  });
}
