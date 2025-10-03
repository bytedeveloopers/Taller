import { BackupService } from "@/services/BackupService";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// GET /api/backup/download/[id] - Descargar backup
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const log = await BackupService.getLog(params.id);

    if (!log) {
      return NextResponse.json({ success: false, error: "Backup no encontrado" }, { status: 404 });
    }

    if (log.estado !== "OK") {
      return NextResponse.json(
        { success: false, error: "El backup no está disponible para descarga" },
        { status: 400 }
      );
    }

    if (!log.ubicacion || !log.ubicacion.startsWith("file://")) {
      return NextResponse.json(
        { success: false, error: "Backup no disponible para descarga directa" },
        { status: 400 }
      );
    }

    const filePath = log.ubicacion.replace("file://", "");

    try {
      const fileStats = await stat(filePath);
      const fileName = path.basename(filePath);

      // Crear stream del archivo
      const fileStream = createReadStream(filePath);

      // Configurar headers para descarga
      const headers = new Headers({
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileStats.size.toString(),
        "Cache-Control": "no-cache",
      });

      // Crear ReadableStream compatible con NextResponse
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            controller.enqueue(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));
          });

          fileStream.on("end", () => {
            controller.close();
          });

          fileStream.on("error", (error) => {
            controller.error(error);
          });
        },
      });

      return new NextResponse(stream, { headers });
    } catch (fileError) {
      console.error("Error accediendo al archivo de backup:", fileError);
      return NextResponse.json(
        { success: false, error: "Archivo de backup no encontrado" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error descargando backup:", error);
    return NextResponse.json(
      { success: false, error: "Error al descargar el backup" },
      { status: 500 }
    );
  }
}
