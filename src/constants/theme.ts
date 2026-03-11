import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#208AEF",
    primaryLight: "#E6F4FE",
    background: "#FFFFFF",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    surface: "#F5F5F5",
    text: "#1A1A1A",
    textSecondary: "#666666",
    border: "#E0E0E0",
    error: "#D32F2F",
    success: "#4CAF50",
    warning: "#FF9800",
  },
  dark: {
    primary: "#208AEF",
    primaryLight: "#1A3A5C",
    background: "#121212",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    surface: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#AAAAAA",
    border: "#333333",
    error: "#EF5350",
    success: "#66BB6A",
    warning: "#FFA726",
  },
} as const;

export type ThemeColor = keyof (typeof Colors)["light"] &
  keyof (typeof Colors)["dark"];

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FontSize = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  tabLabel: 14,
  tabIcon: 28,
} as const;

export const TAB_BAR_HEIGHT = 80;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
