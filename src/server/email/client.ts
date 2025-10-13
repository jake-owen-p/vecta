import { SESv2Client } from "@aws-sdk/client-sesv2";

import { env } from "~/env";

if (!env.AWS_REGION) {
  throw new Error("AWS_REGION is not configured for SES client");
}

export const ses = new SESv2Client({
  region: 'eu-west-1',
});

