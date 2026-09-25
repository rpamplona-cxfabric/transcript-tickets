import type { WorkspaceSettings } from "./types";

export const defaultWorkspaceSettings: WorkspaceSettings = {
  businessHours: {
    friday: { enabled: true, start: "09:00", end: "17:00" },
    monday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
    sunday: { enabled: false, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
  },
  timezone: "America/Chicago",
};
