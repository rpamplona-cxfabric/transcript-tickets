import axios from 'axios';

const TRANSCRIPTS_EXECUTOR_URL = 'https://cxf-executor-qa.cxfabric.io/restendpoint';
const TRANSCRIPTS_FLOW_ID = '25bffe69-38a9-497c-b4cf-8d0432ca4373';

interface IsProcessedExecutorResponse {
  success: boolean;
  item: {
    tenantId: string;
    transcriptId: string;
  } | null;
}

export async function isTranscriptProcessed(
  tenantId: string,
  transcriptId: string
): Promise<boolean> {
  try {
    const { data: result } = await axios.post<IsProcessedExecutorResponse>(
      TRANSCRIPTS_EXECUTOR_URL,
      { transcriptId },
      {
        params: {
          tenant_id: tenantId,
          flow_id: TRANSCRIPTS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: 'isProcessed',
        }
      }
    );

    if (!result.success) {
      throw new Error('CXFabric returned an invalid processed-status response');
    }

    return result.item?.transcriptId === transcriptId;
  } catch (error) {
    console.error('Error checking processed tenant transcript:', error);
    return false;
  }
}
