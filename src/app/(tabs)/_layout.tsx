import { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, TAB_BAR_HEIGHT } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type TabConfig = {
  name: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
  activeColor: string;
};

const TABS: TabConfig[] = [
  { name: "index", labelKey: "tabs.home", icon: "home", iconOutline: "home-outline", activeColor: "#208AEF" },
  { name: "notebook", labelKey: "tabs.notebook", icon: "book", iconOutline: "book-outline", activeColor: "#208AEF" },
  { name: "calendar", labelKey: "tabs.calendar", icon: "calendar", iconOutline: "calendar-outline", activeColor: "#208AEF" },
  { name: "emergency", labelKey: "tabs.emergency", icon: "shield-checkmark", iconOutline: "shield-checkmark-outline", activeColor: "#208AEF" },
];

const CIRCLE_SIZE = 40;
const BAR_HEIGHT = 72;

const CustomTabBar = memo(function CustomTabBar({
  state,
  navigation,
}: {
  state: any;
  navigation: any;
}) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 16);
  const barBg = scheme === "dark" ? "#1E1F23" : "#FFFFFF";

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <View style={[styles.tabBar, { backgroundColor: barBg }]}>
        {TABS.map((tab, index) => {
          const isActive = state.index === index;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {isActive ? (
                <View
                  style={[
                    styles.activeCircle,
                    { backgroundColor: tab.activeColor },
                  ]}
                >
                  <Ionicons name={tab.icon} size={20} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.inactiveCircle}>
                  <Ionicons
                    name={tab.iconOutline}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              )}
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive
                      ? colors.primary
                      : colors.textSecondary,
                    fontWeight: isActive ? "700" : "400",
                  },
                ]}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

export default function TabsLayout() {
  const renderTabBar = useCallback(
    ({ state, navigation }: any) => (
      <CustomTabBar state={state} navigation={navigation} />
    ),
    []
  );

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
  },
  tabBar: {
    flexDirection: "row",
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: BAR_HEIGHT,
    gap: 2,
  },
  activeCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
  },
});
