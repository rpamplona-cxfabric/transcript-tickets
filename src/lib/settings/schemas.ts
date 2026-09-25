import { z } from "zod";

export const businessDayHoursSchema = z.object({
  enabled: z.boolean(),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const workspaceSettingsSchema = z.object({
  businessHours: z.record(businessDayHoursSchema),
  timezone: z.string().min(1),
});

export const businessSettingsFlowItemSchema = z.object({
  businessHours: z.object({
    dates: z.array(z.record(z.string(), businessDayHoursSchema)),
    timezone: z.string().min(1),
  }),
  tenantId: z.string().min(1),
});
