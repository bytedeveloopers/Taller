import { NextResponse } from "next/server";

// Simple test endpoint to verify API routing works
export async function GET() {
  return NextResponse.json({
    message: "API routing works!",
    timestamp: new Date().toISOString(),
    endpoint: "/api/simple-test",
  });
}
