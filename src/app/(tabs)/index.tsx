import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useFamily } from "@/hooks/useFamily";
import { ScheduleList } from "@/components/calendar/ScheduleList";
import { MemberAvatarList } from "@/components/family/MemberAvatarList";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { toDateString } from "@/utils/date";
import type { EventRow } from "@/types/events";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, isAnonymous } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const today = toDateString(new Date());
  const todayStart = `${today}T00:00:00`;
  const todayEnd = `${today}T23:59:59`;

  const { data: events = [] } = useEvents(
    profile?.family_id,
    todayStart,
    todayEnd
  );

  const { data: members = [] } = useFamily(profile?.family_id);

  function handleEventPress(event: EventRow) {
    router.push(`/(tabs)/calendar/edit-event/${event.id}`);
  }

  function handleMemberPress(id: string) {
    router.push(`/family/${id}`);
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {profile?.display_name
              ? `${profile.display_name}さん`
              : t("tabs.home")}
          </Text>
          <View style={styles.headerRight}>
            {isAnonymous && (
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                style={[styles.loginButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="log-in-outline" size={16} color="#FFFFFF" />
                <Text style={styles.loginText}>{t("auth.login")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              testID="settings-icon"
              onPress={() => router.push("/settings")}
              hitSlop={8}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <MemberAvatarList
          members={members}
          onPress={handleMemberPress}
        />

        <ScheduleList
          events={events}
          title={t("calendar.todaySchedule")}
          onEventPress={handleEventPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
