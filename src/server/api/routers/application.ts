import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { z } from "zod";

import { getDynamoDocClient } from "~/lib/dynamo";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const WorkTypeEnum = z.enum(["REMOTE", "IN_PERSON", "HYBRID"]);
const EmploymentTypeEnum = z.enum(["FULL_TIME", "CONTRACT"]);

const submissionInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1).optional().nullable(),
  workTypes: z.array(WorkTypeEnum).min(1, "Select at least one work type"),
  workTypeLabels: z.array(z.enum(["remote", "in-person", "hybrid"])).min(1),
  employmentTypes: z.array(EmploymentTypeEnum).min(1, "Select at least one engagement preference"),
  employmentTypeLabels: z.array(z.enum(["full-time", "contract"])).min(1),
  cv: z.object({
    objectKey: z.string().min(1),
    url: z.string().url().nullable().optional(),
    name: z.string().min(1),
    type: z.string().min(1),
    size: z.number().int().positive(),
  }),
});

export const applicationRouter = createTRPCRouter({
  submit: publicProcedure
    .input(submissionInputSchema)
    .mutation(async ({ input }) => {
      if (!env.AWS_REGION) {
        throw new Error("AWS_REGION is not configured");
      }

      if (!env.AWS_DYNAMO_TABLE) {
        throw new Error("AWS_DYNAMO_TABLE is not configured");
      }

      const docClient = getDynamoDocClient();

      const id = nanoid();
      const nowIso = new Date().toISOString();

      const putCommand = new PutCommand({
        TableName: env.AWS_DYNAMO_TABLE,
        Item: {
          pk: `APPLICATION#${id}`,
          sk: `APPLICATION#${id}`,
          id,
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          workTypes: input.workTypes,
          workTypeLabels: input.workTypeLabels,
          employmentTypes: input.employmentTypes,
          employmentTypeLabels: input.employmentTypeLabels,
          cv: {
            objectKey: input.cv.objectKey,
            url: input.cv.url ?? null,
            name: input.cv.name,
            type: input.cv.type,
            size: input.cv.size,
          },
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      });

      await docClient.send(putCommand);

      return { id };
    }),
});

