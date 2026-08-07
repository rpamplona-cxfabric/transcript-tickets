import { BatchGetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../client';

const SETH_LEADS_TABLE = 'seth-leads';

export async function getSethLeadsByIds(leadIds: Array<string | number>): Promise<any[]> {
  try {
    const uniqueIds = Array.from(new Set(leadIds.map((id) => `${id}`.trim()).filter(Boolean)));
    if (uniqueIds.length === 0) return [];

    const result = await docClient.send(new BatchGetCommand({
      RequestItems: { [SETH_LEADS_TABLE]: { Keys: uniqueIds.map((id) => ({ leadId: id })) } },
    }));

    const items = result.Responses?.[SETH_LEADS_TABLE] || [];
    const byId = new Map(items.map((item: any) => [`${item.leadId}`, item]));
    return uniqueIds.map((id) => byId.get(id)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching leads by ids from seth-leads:', error);
    return [];
  }
}

export async function searchSethLeads(query: string): Promise<any[]> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: SETH_LEADS_TABLE,
    }));
    const items = result.Items || [];

    if (!query || query.trim() === '') {
      return items.slice(0, 50);
    }

    const lowerQuery = query.toLowerCase().trim();
    const filtered = items.filter((item: any) => {
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim().toLowerCase();
      return fullName.includes(lowerQuery) ||
             (item.firstName && item.firstName.toLowerCase().includes(lowerQuery)) ||
             (item.lastName && item.lastName.toLowerCase().includes(lowerQuery));
    });

    return filtered.slice(0, 50);
  } catch (error) {
    console.error('Error scanning seth-leads table:', error);
    return [];
  }
}

export async function checkLeadExists(firstName: string, lastName: string): Promise<boolean> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: SETH_LEADS_TABLE,
    }));
    const items = result.Items || [];

    const lowerFirst = firstName.trim().toLowerCase();
    const lowerLast = lastName.trim().toLowerCase();

    return items.some((item: any) => {
      const itemFirst = (item.firstName || '').trim().toLowerCase();
      const itemLast = (item.lastName || '').trim().toLowerCase();
      return itemFirst === lowerFirst && itemLast === lowerLast;
    });
  } catch (error) {
    console.error('Error checking duplicate lead in seth-leads:', error);
    return false;
  }
}
