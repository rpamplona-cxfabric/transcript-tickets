import { z } from "zod";

export const businessDayHoursSchema = z.object({
  enabled: z.boolean(),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const spamHandlingSettingsSchema = z.object({
  allowList: z.array(z.string()),
  blockList: z.array(z.string()),
  blockUnknownCallers: z.boolean(),
  enabled: z.boolean(),
  notifyOnScreenedCalls: z.boolean(),
  treatment: z.enum(["block", "silence", "voicemail"]),
});

export const routingDestinationSchema = z.object({
  flowId: z.string().min(1).optional(),
  teamId: z.string().min(1).optional(),
  type: z.enum(["flow", "reject", "team", "unassigned", "user", "voicemail"]),
  userId: z.string().min(1).optional(),
});

export const callRoutingSettingsSchema = z.object({
  afterHours: z.object({
    destination: routingDestinationSchema,
    enabled: z.boolean(),
  }),
  defaultDestination: routingDestinationSchema,
  fallbackDestination: routingDestinationSchema,
  noAnswer: z.object({
    destination: routingDestinationSchema,
    enabled: z.boolean(),
    ringTimeoutSeconds: z.number().int().min(5).max(120),
  }),
});

export const workspaceSettingsSchema = z.object({
  businessHours: z.record(businessDayHoursSchema),
  callRouting: callRoutingSettingsSchema,
  spamHandling: spamHandlingSettingsSchema,
  timezone: z.string().min(1),
});

export const businessSettingsFlowItemSchema = z.object({
  businessHours: z.object({
    dates: z.array(z.record(z.string(), businessDayHoursSchema)),
    timezone: z.string().min(1),
  }),
  callRouting: callRoutingSettingsSchema.optional(),
  spamHandling: spamHandlingSettingsSchema.optional(),
  tenantId: z.string().min(1),
});
