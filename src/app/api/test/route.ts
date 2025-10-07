import { NextResponse } from "next/server";

// Simple test endpoint
export async function GET() {
  return NextResponse.json({
    message: "Test endpoint working!",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "POST received successfully!",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid JSON in request body",
      },
      { status: 400 }
    );
  }
}
