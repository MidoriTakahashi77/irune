import type { EventCategory } from "@/types/events";

export const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; labelKey: string; color: string; icon: string }
> = {
  health: {
    label: "通院・健康",
    labelKey: "categories.health",
    color: "#4CAF50",
    icon: "heart",
  },
  family: {
    label: "家族",
    labelKey: "categories.family",
    color: "#2196F3",
    icon: "people",
  },
  errands: {
    label: "用事",
    labelKey: "categories.errands",
    color: "#FF9800",
    icon: "cart",
  },
  social: {
    label: "交流",
    labelKey: "categories.social",
    color: "#9C27B0",
    icon: "chatbubbles",
  },
};

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as EventCategory[];
