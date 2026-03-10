import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors, FontSize, TAB_BAR_HEIGHT } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabsLayout() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: TAB_BAR_HEIGHT,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: FontSize.tabLabel,
          fontWeight: "600",
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={FontSize.tabIcon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notebook"
        options={{
          title: t("tabs.notebook"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={FontSize.tabIcon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t("tabs.calendar"),
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="calendar"
              size={FontSize.tabIcon}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: t("tabs.emergency"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="warning" size={FontSize.tabIcon} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
