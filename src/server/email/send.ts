import { SendEmailCommand } from "@aws-sdk/client-sesv2";

import { getEmailTemplate } from "~/server/email/templates";
import type { SendEmailInput } from "~/server/email/types";
import { ses } from "./client";

export const sendEmailByType = async ({ type, to, params }: SendEmailInput) => {
  if (to.length === 0) {
    throw new Error("Email destination array must not be empty");
  }

  const { subject, html } = getEmailTemplate(type, params);

  const command = new SendEmailCommand({
    FromEmailAddress: "Vecta <team@vecta.co>",
    Destination: {
      ToAddresses: to,
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  await ses.send(command);
};

