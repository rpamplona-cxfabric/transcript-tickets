import { executeSethLeadsFlow } from "./flow";

type SethLeadRecord = Record<string, any>;

interface GetSethLeadExecutorResponse {
  success: boolean;
  item: SethLeadRecord | null;
}

interface GetSethLeadsExecutorResponse {
  success: boolean;
  items: SethLeadRecord[];
}

export async function getSethLeadById(
  tenantId: string,
  leadId: string,
): Promise<SethLeadRecord | null> {
  try {
    const normalizedLeadId = leadId.trim();
    if (!normalizedLeadId) {
      return null;
    }

    const result = await executeSethLeadsFlow<GetSethLeadExecutorResponse>({
      action: "getSethLead",
      payload: { leadId: normalizedLeadId },
      tenantId,
    });

    if (!result.success) {
      throw new Error("CXFabric returned an invalid lead response");
    }

    return result.item ?? null;
  } catch (error) {
    console.error("Error fetching lead by id from CXFabric:", error);
    return null;
  }
}

export async function getSethLeads(
  tenantId: string,
): Promise<SethLeadRecord[]> {
  try {
    const result = await executeSethLeadsFlow<GetSethLeadsExecutorResponse>({
      action: "getSethLeads",
      tenantId,
    });

    if (!result.success || !Array.isArray(result.items)) {
      throw new Error("CXFabric returned an invalid leads response");
    }

    return result.items.map(
      ({ leadId, firstName, lastName, emails, phones }) => ({
        leadId,
        firstName,
        lastName,
        emails,
        phones,
      }),
    );
  } catch (error) {
    console.error("Error fetching leads from CXFabric:", error);
    return [];
  }
}

export async function checkLeadExists(
  tenantId: string,
  firstName: string,
  lastName: string,
): Promise<boolean> {
  try {
    const items = await getSethLeads(tenantId);

    const lowerFirst = firstName.trim().toLowerCase();
    const lowerLast = lastName.trim().toLowerCase();

    return items.some((item: any) => {
      const itemFirst = (item.firstName || "").trim().toLowerCase();
      const itemLast = (item.lastName || "").trim().toLowerCase();
      return itemFirst === lowerFirst && itemLast === lowerLast;
    });
  } catch (error) {
    console.error("Error checking duplicate lead in seth-leads:", error);
    return false;
  }
}
