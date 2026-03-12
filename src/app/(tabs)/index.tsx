import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useFamily } from "@/hooks/useFamily";
import { ScheduleList } from "@/components/calendar/ScheduleList";
import { MemberAvatarList } from "@/components/family/MemberAvatarList";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { toDateString } from "@/utils/date";
import type { EventRow } from "@/types/events";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, signOut } = useAuth();
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
          <Button
            title={t("auth.logout")}
            onPress={signOut}
            variant="ghost"
            textStyle={{ fontSize: FontSize.sm }}
          />
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
});
