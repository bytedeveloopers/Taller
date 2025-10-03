/**
 * API endpoint para probar la conectividad con destinos de respaldo
 * POST /api/backup/test-connection - Prueba la conexión con S3, MinIO o almacenamiento local
 */

import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipoDestino, config } = body;

    let resultado = {
      conectado: false,
      mensaje: "",
      detalles: {},
    };

    switch (tipoDestino) {
      case "local":
        resultado = await testLocalConnection(config.rutaLocal);
        break;

      case "s3":
        resultado = await testS3Connection({
          region: config.s3Endpoint,
          bucket: config.s3Bucket,
          accessKeyId: config.s3AccessKey,
          secretAccessKey: config.s3SecretKey,
        });
        break;

      case "minio":
        resultado = await testMinIOConnection({
          endpoint: config.s3Endpoint,
          bucket: config.s3Bucket,
          accessKeyId: config.s3AccessKey,
          secretAccessKey: config.s3SecretKey,
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Tipo de destino no válido",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error testing backup connection:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al probar la conexión",
      },
      { status: 500 }
    );
  }
}

async function testLocalConnection(rutaLocal: string): Promise<any> {
  try {
    if (!rutaLocal) {
      return {
        conectado: false,
        mensaje: "Debe especificar una ruta local",
        detalles: {},
      };
    }

    // Intentar crear el directorio si no existe
    const fullPath = path.resolve(rutaLocal);
    await fs.mkdir(fullPath, { recursive: true });

    // Verificar permisos de escritura
    const testFile = path.join(fullPath, "test-backup.tmp");
    await fs.writeFile(testFile, "test");
    await fs.unlink(testFile);

    // Obtener información del directorio
    const stats = await fs.stat(fullPath);

    return {
      conectado: true,
      mensaje: "Conexión local exitosa",
      detalles: {
        ruta: fullPath,
        permisos: "Lectura y escritura disponibles",
        fechaCreacion: stats.birthtime,
        tamanio: stats.size,
      },
    };
  } catch (error: any) {
    return {
      conectado: false,
      mensaje: `Error en almacenamiento local: ${error.message}`,
      detalles: { error: error.message },
    };
  }
}

async function testS3Connection(config: any): Promise<any> {
  try {
    const { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } = await import(
      "@aws-sdk/client-s3"
    );

    const s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Verificar que el bucket existe
    await s3.send(new HeadBucketCommand({ Bucket: config.bucket }));

    // Probar escritura con un archivo de prueba
    const testKey = `backup-test-${Date.now()}.tmp`;
    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: testKey,
        Body: "test backup connectivity",
      })
    );

    // Limpiar archivo de prueba
    await s3.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: testKey,
      })
    );

    return {
      conectado: true,
      mensaje: "Conexión S3 exitosa",
      detalles: {
        region: config.region,
        bucket: config.bucket,
        permisos: "Lectura y escritura disponibles",
      },
    };
  } catch (error: any) {
    return {
      conectado: false,
      mensaje: `Error en S3: ${error.message}`,
      detalles: {
        error: error.message,
        code: error.code,
      },
    };
  }
}

async function testMinIOConnection(config: any): Promise<any> {
  try {
    const { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } = await import(
      "@aws-sdk/client-s3"
    );

    const s3 = new S3Client({
      endpoint: config.endpoint,
      region: "us-east-1", // MinIO requires a region
      forcePathStyle: true, // Necesario para MinIO
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Verificar que el bucket existe
    await s3.send(new HeadBucketCommand({ Bucket: config.bucket }));

    // Probar escritura con un archivo de prueba
    const testKey = `backup-test-${Date.now()}.tmp`;
    await s3.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: testKey,
        Body: "test backup connectivity",
      })
    );

    // Limpiar archivo de prueba
    await s3.send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: testKey,
      })
    );

    return {
      conectado: true,
      mensaje: "Conexión MinIO exitosa",
      detalles: {
        endpoint: config.endpoint,
        bucket: config.bucket,
        permisos: "Lectura y escritura disponibles",
      },
    };
  } catch (error: any) {
    return {
      conectado: false,
      mensaje: `Error en MinIO: ${error.message}`,
      detalles: {
        error: error.message,
        code: error.code,
      },
    };
  }
}
