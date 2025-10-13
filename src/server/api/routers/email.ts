import { z } from "zod";

import { sendEmailByType } from "~/server/email/send";
import type { EmailType } from "~/server/email/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const emailTypeSchema: z.ZodType<EmailType> = z.enum([
  "application_submitted",
  "application_rejected",
  "application_successful",
]);

export const emailRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        type: emailTypeSchema,
        to: z.array(z.string().email()).min(1),
        params: z
          .object({
            name: z.string().optional(),
            applicantEmail: z.string().email().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await sendEmailByType(input);
      return { ok: true } as const;
    }),
});

