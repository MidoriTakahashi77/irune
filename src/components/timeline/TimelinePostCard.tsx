import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { useDeletePost, useRetryPost } from "@/hooks/useTimeline";
import type { TimelinePostWithDetails, ProfileRow } from "@/types/events";

// 自分のバブル色
const OWN_BUBBLE = {
  light: "#E8DCC8",
  dark: "#3D3529",
} as const;

// 他人のバブル色
const OTHER_BUBBLE = {
  light: "#F5F0EB",
  dark: "#2A2825",
} as const;

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function renderBodyWithMentions(
  body: string,
  mentions: string[],
  memberMap: Map<string, Pick<ProfileRow, "display_name" | "color">>,
  textColor: string,
  accentColor: string
) {
  if (!mentions.length) {
    return <Text style={[s.bodyText, { color: textColor }]}>{body}</Text>;
  }

  const parts: React.ReactNode[] = [];
  let remaining = body;
  let key = 0;

  for (const uid of mentions) {
    const member = memberMap.get(uid);
    if (!member) continue;
    const tag = `@${member.display_name}`;
    const idx = remaining.indexOf(tag);
    if (idx === -1) continue;
    if (idx > 0) {
      parts.push(<Text key={key++} style={{ color: textColor }}>{remaining.slice(0, idx)}</Text>);
    }
    parts.push(
      <Text key={key++} style={{ color: member.color || accentColor, fontWeight: "700" }}>{tag}</Text>
    );
    remaining = remaining.slice(idx + tag.length);
  }
  if (remaining) {
    parts.push(<Text key={key++} style={{ color: textColor }}>{remaining}</Text>);
  }

  return <Text style={[s.bodyText, { color: textColor }]}>{parts.length > 0 ? parts : body}</Text>;
}

const SWIPE_THRESHOLD = -50;

interface TimelinePostCardProps {
  post: TimelinePostWithDetails;
  onReply?: (post: TimelinePostWithDetails) => void;
  memberMap: Map<string, Pick<ProfileRow, "display_name" | "color">>;
  showAvatar: boolean;
  showName: boolean;
}

export const TimelinePostCard = React.memo(function TimelinePostCard({
  post,
  onReply,
  memberMap,
  showAvatar,
  showName,
}: TimelinePostCardProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user } = useAuth();
  const deletePost = useDeletePost();
  const retryPost = useRetryPost();

  const isOwn = user?.id === post.author_id;
  const isPending = post._optimistic;
  const isFailed = post._error;
  const authorName = post.profiles?.display_name ?? "?";
  const authorColor = post.profiles?.color ?? "#999999";
  const isActivity = post.type !== "post";
  const replyTo = post.reply_to;

  const bubbleBg = isOwn ? OWN_BUBBLE[scheme] : OTHER_BUBBLE[scheme];

  // スワイプ — ref で最新の props を PanResponder クロージャから参照
  const onReplyRef = useRef(onReply);
  onReplyRef.current = onReply;
  const postRef = useRef(post);
  postRef.current = post;

  const translateX = useRef(new Animated.Value(0)).current;
  const replyIconOpacity = useRef(new Animated.Value(0)).current;

  const resetSwipe = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
    Animated.timing(replyIconOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [translateX, replyIconOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, gs) =>
        gs.dx < -10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_e, gs) => {
        const x = Math.max(gs.dx, -90);
        translateX.setValue(x);
        replyIconOpacity.setValue(Math.min(Math.abs(x) / 40, 1));
      },
      onPanResponderRelease: (_e, gs) => {
        if (gs.dx < SWIPE_THRESHOLD) onReplyRef.current?.(postRef.current);
        resetSwipe();
      },
      onPanResponderTerminate: () => {
        resetSwipe();
      },
    })
  ).current;

  const handleLongPress = useCallback(() => {
    if (!isOwn) return;
    Alert.alert(t("timeline.deleteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deletePost.mutate(post.id),
      },
    ]);
  }, [post.id, deletePost, t, isOwn]);

  const handleRetry = useCallback(() => {
    retryPost(post);
  }, [retryPost, post]);

  return (
    <View style={s.outerRow}>
      <Animated.View style={[s.replyHint, { opacity: replyIconOpacity }]}>
        <Ionicons name="arrow-undo" size={18} color={colors.primary} />
      </Animated.View>

      <Animated.View
        style={[{ transform: [{ translateX }], flex: 1 }]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            s.messageRow,
            isOwn ? s.messageRowOwn : s.messageRowOther,
          ]}
        >
          {/* 他人のアバター (左) */}
          {!isOwn && (
            <View style={s.avatarCol}>
              {showAvatar ? (
                <View style={[s.avatar, { backgroundColor: authorColor }]}>
                  <Text style={s.avatarText}>{authorName.charAt(0)}</Text>
                </View>
              ) : (
                <View style={s.avatarSpacer} />
              )}
            </View>
          )}

          <View style={[s.bubbleCol, isOwn ? s.bubbleColOwn : s.bubbleColOther]}>
            {/* 名前 (他人の場合、グループの最初だけ) */}
            {!isOwn && showName && (
              <Text style={[s.nameLabel, { color: authorColor }]}>
                {authorName}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onLongPress={handleLongPress}
              delayLongPress={500}
            >
              {/* 引用元 */}
              {replyTo && (
                <View
                  style={[
                    s.quote,
                    {
                      backgroundColor: isOwn
                        ? "rgba(0,0,0,0.06)"
                        : "rgba(0,0,0,0.04)",
                      borderLeftColor: replyTo.profiles?.color ?? colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.quoteAuthor,
                      { color: replyTo.profiles?.color ?? colors.textSecondary },
                    ]}
                  >
                    {replyTo.profiles?.display_name ?? "?"}
                  </Text>
                  <Text
                    style={[s.quoteBody, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {replyTo.type === "post"
                      ? replyTo.body
                      : replyTo.ref_summary ?? ""}
                  </Text>
                </View>
              )}

              <View
                style={[
                  s.bubble,
                  { backgroundColor: bubbleBg },
                  isOwn ? s.bubbleOwn : s.bubbleOther,
                ]}
              >
                {isActivity ? (
                  <View>
                    <Text style={[s.activityLabel, { color: colors.textSecondary }]}>
                      {t(
                        post.type === "event"
                          ? "timeline.activityEvent"
                          : post.type === "diary"
                            ? "timeline.activityDiary"
                            : "timeline.activityNote",
                        { name: authorName }
                      )}
                    </Text>
                    {post.ref_summary && (
                      <Text style={[s.refText, { color: colors.text }]}>
                        {post.ref_summary}
                      </Text>
                    )}
                  </View>
                ) : (
                  renderBodyWithMentions(
                    post.body ?? "",
                    post.mentions ?? [],
                    memberMap,
                    colors.text,
                    colors.primary
                  )
                )}
              </View>
            </TouchableOpacity>

            {/* 時間 / ステータス (LINE風: バブルの横に表示) */}
            {isFailed ? (
              <TouchableOpacity
                onPress={handleRetry}
                style={[s.statusRow, isOwn ? s.statusRowOwn : s.statusRowOther]}
                hitSlop={8}
              >
                <Ionicons name="alert-circle" size={14} color={colors.error} />
                <Text style={[s.time, { color: colors.error }]}>
                  {t("timeline.sendFailed")}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[s.statusRow, isOwn ? s.statusRowOwn : s.statusRowOther]}>
                <Text style={[s.time, { color: colors.textSecondary }]}>
                  {isPending ? "" : formatTime(post.created_at)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

const s = StyleSheet.create({
  outerRow: {
    overflow: "hidden",
  },
  replyHint: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 36,
  },
  messageRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  avatarCol: {
    width: 36,
    marginRight: 6,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  avatarSpacer: {
    width: 32,
  },
  bubbleCol: {
    maxWidth: "75%",
  },
  bubbleColOwn: {
    alignItems: "flex-end",
  },
  bubbleColOther: {
    alignItems: "flex-start",
  },
  nameLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    marginLeft: 10,
  },
  quote: {
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: -8,
    paddingBottom: 14,
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 1,
  },
  quoteBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 40,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 21,
  },
  activityLabel: {
    fontSize: 13,
    fontStyle: "italic",
  },
  refText: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    marginBottom: 4,
  },
  statusRowOwn: {
    justifyContent: "flex-end",
    marginRight: 4,
  },
  statusRowOther: {
    justifyContent: "flex-start",
    marginLeft: 4,
  },
  errorBtn: {
    padding: 2,
  },
  time: {
    fontSize: 11,
  },
});
