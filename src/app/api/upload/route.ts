import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "~/env";

const requestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(15 * 1024 * 1024, "File size must be under 15MB"),
});

if (!env.AWS_REGION) {
  throw new Error("AWS_REGION environment variable is required for uploads");
}

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const { filename, fileType, fileSize } = requestSchema.parse(json);

    const key = `cvs/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_/]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_UPLOAD_BUCKET,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({
      uploadUrl: signedUrl,
      objectKey: key,
      bucket: env.AWS_S3_UPLOAD_BUCKET,
      region: env.AWS_REGION,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create presigned upload URL";
    console.error(message, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


