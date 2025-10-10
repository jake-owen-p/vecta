import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { env } from "~/env";

let dynamoDocClient: DynamoDBDocumentClient | null = null;

const createClient = () => {
  const client = new DynamoDBClient({
    region: env.AWS_REGION,
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};

export const getDynamoDocClient = () => (dynamoDocClient ??= createClient());

