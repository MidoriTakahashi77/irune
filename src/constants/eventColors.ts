export const EVENT_COLORS = [
  "#208AEF", // blue (default)
  "#D32F2F", // red
  "#E91E63", // pink
  "#9C27B0", // purple
  "#4CAF50", // green
  "#FF9800", // orange
  "#795548", // brown
  "#607D8B", // gray-blue
] as const;

export type EventColor = (typeof EVENT_COLORS)[number];
