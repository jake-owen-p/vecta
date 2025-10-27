import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { getDynamoDocClient } from "~/lib/dynamo";
import { env } from "~/env";
import { sendEmailByType } from "~/server/email/send";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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

const decisionSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["accept", "reject"]),
});

const systemDesignSchema = z.object({
  id: z.string().min(1),
});

const safeString = (value: unknown) => (typeof value === "string" ? value : undefined);
const safeStringOrNull = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value === null) return null;
  return undefined;
};
const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [] as string[];
  return value.filter((item): item is string => typeof item === "string");
};
const safeUrl = (value: unknown) => {
const safeAgenticShowcase = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const highlights = safeString(record.highlights);
  if (!highlights) {
    return undefined;
  }

  const githubUrl = safeUrl(record.githubUrl) ?? null;
  const links = toStringArray(record.links);

  return { highlights, githubUrl, links } as {
    highlights: string;
    githubUrl: string | null;
    links: string[];
  };
};
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.toString();
  } catch (error) {
    void error;
    return undefined;
  }
};

export const adminRouter = createTRPCRouter({
  listApplications: publicProcedure.query(async () => {
    if (!env.AWS_REGION) {
      throw new Error("AWS_REGION is not configured");
    }
    if (!env.AWS_DYNAMO_TABLE) {
      throw new Error("AWS_DYNAMO_TABLE is not configured");
    }
    if (!env.AWS_S3_UPLOAD_BUCKET) {
      throw new Error("AWS_S3_UPLOAD_BUCKET is not configured");
    }

    const docClient = getDynamoDocClient();

    const scanCommand = new ScanCommand({
      TableName: env.AWS_DYNAMO_TABLE,
      FilterExpression: "begins_with(#pk, :pk)",
      ExpressionAttributeNames: { "#pk": "pk" },
      ExpressionAttributeValues: { ":pk": "APPLICATION#" },
    });

    const scanResult = await docClient.send(scanCommand);
    const items = (scanResult.Items ?? []) as Array<Record<string, unknown>>;

    const applications = await Promise.all(
      items
        .map((item) => {
          const id = safeString(item.id);
          const name = safeString(item.name);
          const email = safeString(item.email);
          const phone = safeStringOrNull(item.phone ?? null);
          const workTypeLabels = toStringArray(item.workTypeLabels);
          const employmentTypeLabels = toStringArray(item.employmentTypeLabels);
          const createdAt = safeString(item.createdAt);
          const updatedAt = safeString(item.updatedAt);
          const status = safeString(item.status) ?? "PENDING";
          const cv = item.cv;
          const agenticShowcaseRaw = item.agenticShowcase;
          const jobType = safeString(item.jobType);

          if (!cv || typeof cv !== "object") {
            return null;
          }
          const objectKey = "objectKey" in cv && typeof cv.objectKey === "string" ? cv.objectKey : undefined;
          if (!objectKey) {
            return null;
          }

          if (!id || !name || !email || !createdAt || !updatedAt) {
            return null;
          }

          const cvDetails = cv as Record<string, unknown>;

          const agenticShowcase = safeAgenticShowcase(agenticShowcaseRaw);

          return {
            id,
            name,
            email,
            phone: phone ?? null,
            workTypeLabels,
            employmentTypeLabels,
            createdAt,
            updatedAt,
            status,
            cv: {
              objectKey,
              name: safeString(cvDetails.name) ?? "",
              type: safeString(cvDetails.type) ?? "",
              size: typeof cvDetails.size === "number" ? cvDetails.size : 0,
            },
            agenticShowcase,
            jobType: jobType ?? null,
          };
        })
        .filter((value): value is NonNullable<typeof value> => value !== null)
        .map(async (app) => {
          const getCmd = new GetObjectCommand({
            Bucket: env.AWS_S3_UPLOAD_BUCKET!,
            Key: app.cv.objectKey,
          });
          const url = await getSignedUrl(s3Client, getCmd, { expiresIn: 900 });

          return { ...app, cvUrl: url };
        }),
    );

    return applications
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }),

  decide: publicProcedure
    .input(decisionSchema)
    .mutation(async ({ input }) => {
      if (!env.AWS_REGION) {
        throw new Error("AWS_REGION is not configured");
      }
      if (!env.AWS_DYNAMO_TABLE) {
        throw new Error("AWS_DYNAMO_TABLE is not configured");
      }
      if (!env.AWS_S3_UPLOAD_BUCKET) {
        throw new Error("AWS_S3_UPLOAD_BUCKET is not configured");
      }

      const docClient = getDynamoDocClient();
      const nowIso = new Date().toISOString();

      const newStatus = input.decision === "accept" ? "ACCEPTED" : "REJECTED";

      const updateCommand = new UpdateCommand({
        TableName: env.AWS_DYNAMO_TABLE,
        Key: { id: input.id },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": newStatus,
          ":updatedAt": nowIso,
        },
        ConditionExpression: "attribute_exists(pk)",
        ReturnValues: "ALL_NEW",
      });

      const updateResult = await docClient.send(updateCommand);
      const updated = updateResult.Attributes as
        | (Record<string, unknown> & { email?: string; name?: string; cv?: Record<string, unknown> })
        | undefined;

      const email = safeString(updated?.email);
      const name = safeString(updated?.name);
      const cvObjectKey = updated?.cv && typeof updated.cv === "object" ? safeString(updated.cv.objectKey) : undefined;

      if (email) {
        try {
          await sendEmailByType({
            type: input.decision === "accept" ? "application_successful" : "application_rejected",
            to: [email],
            params: { name: name ?? null, applicantEmail: email ?? null },
          });
        } catch (err) {
          console.error("Failed to send decision email", err);
        }
      }

      return { ok: true as const, status: newStatus };
    }),

  moveToSystemDesign: publicProcedure
    .input(systemDesignSchema)
    .mutation(async ({ input }) => {
      if (!env.AWS_REGION) {
        throw new Error("AWS_REGION is not configured");
      }
      if (!env.AWS_DYNAMO_TABLE) {
        throw new Error("AWS_DYNAMO_TABLE is not configured");
      }

      const docClient = getDynamoDocClient();
      const nowIso = new Date().toISOString();

      const updateCommand = new UpdateCommand({
        TableName: env.AWS_DYNAMO_TABLE,
        Key: { id: input.id },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "SYSTEM_DESIGN",
          ":updatedAt": nowIso,
        },
        ReturnValues: "ALL_NEW",
      });

      const updateResult = await docClient.send(updateCommand);
      const updated = updateResult.Attributes as
        | (Record<string, unknown> & { email?: string; name?: string })
        | undefined;

      const email = safeString(updated?.email);
      const name = safeString(updated?.name);

      if (email) {
        try {
          await sendEmailByType({
            type: "application_system_design",
            to: [email],
            params: { name: name ?? null, applicantEmail: email ?? null },
          });
        } catch (err) {
          console.error("Failed to send system design email", err);
        }
      }

      return { ok: true as const, status: "SYSTEM_DESIGN" as const };
    }),
});


