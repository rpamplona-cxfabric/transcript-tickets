export interface SettingsSection {
  description: string;
  items: readonly string[];
  title: string;
}

export const settingsSections: Record<string, SettingsSection> = {
  "call-routing": {
    description:
      "Choose where calls and messages go when a number is unassigned, a user is unavailable, or the workspace is closed.",
    items: [
      "Default destination for unassigned phone numbers",
      "After-hours fallback and voicemail behavior",
      "Unavailable-user and failed-routing fallback",
    ],
    title: "Call routing",
  },
  "spam-handling": {
    description:
      "Set how suspected spam calls and messages are identified, handled, and surfaced to your workspace.",
    items: [
      "Screening and block-list behavior",
      "Silence, reject, or route suspicious callers",
      "Spam activity alerts and review history",
    ],
    title: "Spam handling",
  },
  recording: {
    description:
      "Control the default recording and transcription behavior for calls handled by this workspace.",
    items: [
      "Inbound and outbound recording defaults",
      "Transcription and AI-summary processing",
      "Consent and recording notice settings",
    ],
    title: "Recording and transcripts",
  },
  "data-retention": {
    description:
      "Define how long workspace data is kept before it is automatically removed according to your policy.",
    items: [
      "Recording retention period",
      "Transcript and summary retention period",
      "Automatic deletion policy and exceptions",
    ],
    title: "Data retention",
  },
  notifications: {
    description:
      "Decide who receives important workspace activity and how those alerts should be delivered.",
    items: [
      "Missed-call and voicemail alerts",
      "Transcript-ready and failed-processing alerts",
      "Number assignment and routing-change alerts",
    ],
    title: "Notifications",
  },
};
