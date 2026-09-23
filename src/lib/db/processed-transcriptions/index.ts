import { executeProcessedTranscriptsFlow } from "./flow";

interface IsProcessedExecutorResponse {
  success: boolean;
  item: {
    tenantId: string;
    transcriptId: string;
  } | null;
}

export async function isTranscriptProcessed(
  tenantId: string,
  transcriptId: string,
): Promise<boolean> {
  try {
    const result =
      await executeProcessedTranscriptsFlow<IsProcessedExecutorResponse>({
        action: "isProcessed",
        payload: { transcriptId },
        tenantId,
      });

    if (!result.success) {
      throw new Error("CXFabric returned an invalid processed-status response");
    }

    return result.item?.transcriptId === transcriptId;
  } catch (error) {
    console.error("Error checking processed tenant transcript:", error);
    return false;
  }
}
