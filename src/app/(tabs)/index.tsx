import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { useFamily } from "@/hooks/useFamily";
import {
  TimelineComposer,
  type QuoteReplyContext,
} from "@/components/timeline/TimelineComposer";
import { TimelineList } from "@/components/timeline/TimelineList";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { toDateString, formatTime } from "@/utils/date";
import type {
  EventRow,
  TimelinePostWithDetails,
  ProfileRow,
} from "@/types/events";

const CHAT_BG = {
  light: "#F7F4F0",
  dark: "#1A1816",
} as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, isAnonymous } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const chatBg = CHAT_BG[scheme];
  const [replyContext, setReplyContext] = useState<QuoteReplyContext | null>(
    null
  );

  const today = toDateString(new Date());
  const todayStart = `${today}T00:00:00`;
  const todayEnd = `${today}T23:59:59`;

  const { data: events = [] } = useEvents(
    profile?.family_id,
    todayStart,
    todayEnd
  );

  const { data: members = [] } = useFamily(profile?.family_id);

  const memberMap = useMemo(() => {
    const map = new Map<string, Pick<ProfileRow, "display_name" | "color">>();
    for (const m of members) {
      map.set(m.id, { display_name: m.display_name, color: m.color });
    }
    return map;
  }, [members]);

  const handleReply = useCallback((post: TimelinePostWithDetails) => {
    setReplyContext({ post });
  }, []);

  const handleClearReply = useCallback(() => {
    setReplyContext(null);
  }, []);

  return (
    <SafeAreaView
      style={[st.safe, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* --- 上部ヘッダー (白背景) --- */}
      <View style={[st.topBar, { borderBottomColor: colors.border }]}>
        <View style={st.topBarRight}>
          {isAnonymous && (
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              style={[st.iconBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="log-in-outline" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            testID="settings-icon"
            onPress={() => router.push("/settings")}
            hitSlop={8}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 今日の予定バー (予定があれば表示、別色帯) --- */}
      {events.length > 0 && (
        <View style={[st.scheduleBar, { backgroundColor: colors.primaryLight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.scheduleScroll}
          >
            {events.map((ev: EventRow) => (
              <TouchableOpacity
                key={ev.id}
                style={st.scheduleChip}
                onPress={() => router.push("/(tabs)/calendar")}
                activeOpacity={0.7}
              >
                <View
                  style={[st.scheduleIndicator, { backgroundColor: ev.color || colors.primary }]}
                />
                <Text
                  style={[st.scheduleTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {ev.title}
                </Text>
                <Text style={[st.scheduleTime, { color: colors.textSecondary }]}>
                  {ev.all_day
                    ? t("calendar.allDay")
                    : formatTime(ev.start_at)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* --- チャットエリア (別背景色) --- */}
      <KeyboardAvoidingView
        style={[st.chatArea, { backgroundColor: chatBg }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <TimelineList
          familyId={profile?.family_id}
          onReply={handleReply}
          memberMap={memberMap}
        />

        <TimelineComposer
          replyContext={replyContext}
          onClearReply={handleClearReply}
          members={members}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // 今日の予定バー
  scheduleBar: {
    paddingVertical: 6,
  },
  scheduleScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  scheduleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scheduleIndicator: {
    width: 3,
    height: 14,
    borderRadius: 1.5,
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 120,
  },
  scheduleTime: {
    fontSize: 11,
  },

  // チャットエリア
  chatArea: {
    flex: 1,
  },
});
