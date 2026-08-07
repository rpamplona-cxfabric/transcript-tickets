import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../client';

const PROCESSED_TRANSCRIPTS_TABLE = 'processed-transcripts';
type TranscriptRecord = Record<string, any>;
type QueryPaginationKey = import('@aws-sdk/lib-dynamodb').QueryCommandInput['ExclusiveStartKey'];

export async function getProcessedTranscripts(tenantId: string): Promise<string[]> {
  try {
    const items: TranscriptRecord[] = [];
    let lastEvaluatedKey: QueryPaginationKey;

    do {
      const result = await docClient.send(new QueryCommand({
        TableName: PROCESSED_TRANSCRIPTS_TABLE,
        KeyConditionExpression: '#tenantId = :tenantId',
        ExpressionAttributeNames: {
          '#tenantId': 'tenantId',
        },
        ExpressionAttributeValues: {
          ':tenantId': tenantId,
        },
        ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {}),
      }));

      items.push(...((result.Items || []) as TranscriptRecord[]));
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items.map((item) => item.transcriptId);
  } catch (error) {
    console.error('Error querying processed tenant transcripts:', error);
    return [];
  }
}

export async function isTranscriptProcessed(
  tenantId: string,
  transcriptId: string
): Promise<boolean> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: PROCESSED_TRANSCRIPTS_TABLE,
      Key: {
        tenantId,
        transcriptId,
      },
    }));

    return Boolean(result.Item);
  } catch (error) {
    console.error('Error getting processed tenant transcript:', error);
    return false;
  }
}
