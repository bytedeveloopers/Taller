// src/app/api/backup/route.ts
import { getBackupScheduler, initBackupSystem } from "@/lib/backup-init";
import { NextResponse } from "next/server";

export async function GET() {
  const scheduler = getBackupScheduler() ?? (await initBackupSystem());
  try {
    await scheduler?.runOnce();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
