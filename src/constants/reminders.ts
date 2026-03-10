export const REMINDER_PRESETS = [
  { minutes: 30, labelKey: "event.reminder30min" },
  { minutes: 60, labelKey: "event.reminder1hour" },
  { minutes: 120, labelKey: "event.reminder2hours" },
  { minutes: 1440, labelKey: "event.reminder1day" },
] as const;
