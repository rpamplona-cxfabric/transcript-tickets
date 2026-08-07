import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AMAZON_ACCESS_KEY || '';
const secretAccessKey = process.env.AMAZON_SECRET_KEY || '';
const sessionToken = process.env.AMAZON_SESSION_TOKEN;
const hasCustomCredentials = Boolean(accessKeyId && secretAccessKey);

if ((accessKeyId || secretAccessKey) && !hasCustomCredentials) {
  console.warn(
    'WARNING: Ignoring incomplete AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY credentials. Falling back to the AWS SDK credential provider chain.'
  );
}

const client = new DynamoDBClient({
  region,
  ...(hasCustomCredentials
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        },
      }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
