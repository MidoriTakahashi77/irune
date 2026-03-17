import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTimeline, useLastRead, useMarkAsRead } from "@/hooks/useTimeline";
import { useAuth } from "@/hooks/useAuth";
import { TimelinePostCard } from "./TimelinePostCard";
import type { TimelinePostWithDetails, ProfileRow } from "@/types/events";

function dateLabelText(
  dateStr: string,
  t: (key: string) => string
): string {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, now)) return t("timeline.today");

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(d, yesterday)) return t("timeline.yesterday");

  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function dateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

type ListItem =
  | { kind: "date"; label: string; key: string }
  | {
      kind: "post";
      post: TimelinePostWithDetails;
      showAvatar: boolean;
      showName: boolean;
      key: string;
    };

interface TimelineListProps {
  familyId: string | null | undefined;
  onReply?: (post: TimelinePostWithDetails) => void;
  memberMap: Map<string, Pick<ProfileRow, "display_name" | "color">>;
}

export function TimelineList({
  familyId,
  onReply,
  memberMap,
}: TimelineListProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user } = useAuth();
  const listRef = useRef<FlatList>(null);
  const didScroll = useRef(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useTimeline(familyId);

  const { data: lastReadAt } = useLastRead(user?.id);

  // posts は DESC (newest first) - inverted FlatList で oldest-at-top 表示
  const posts = useMemo(
    () => (data?.pages.flat() ?? []) as TimelinePostWithDetails[],
    [data]
  );

  // 最新投稿の時刻で既読更新
  const newestPostAt = posts.length > 0 ? posts[0].created_at : null;
  useMarkAsRead(user?.id, familyId, newestPostAt);

  // items: DESC 順 (index 0 = newest = 画面下部)
  // 日付セパレータは各日グループの末尾 (= inverted で上部) に挿入
  // eslint-disable-next-line react-hooks/exhaustive-deps -- t は安定参照
  const items = useMemo(() => {
    const result: ListItem[] = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      // 同じ著者で5分以内の連続投稿はグルーピング
      // inverted なので「視覚的に上」= 配列のindex i+1
      const above = posts[i + 1];
      const sameGroup =
        above &&
        above.author_id === post.author_id &&
        dateKey(above.created_at) === dateKey(post.created_at) &&
        Math.abs(
          new Date(post.created_at).getTime() -
            new Date(above.created_at).getTime()
        ) < 5 * 60 * 1000;

      result.push({
        kind: "post",
        post,
        showAvatar: !sameGroup,
        showName: !sameGroup,
        key: post.id,
      });

      // 日付セパレータ: 次の投稿 (配列的に次=index i+1) と日付が異なる場合
      const next = posts[i + 1];
      if (!next || dateKey(next.created_at) !== dateKey(post.created_at)) {
        result.push({
          kind: "date",
          label: dateLabelText(post.created_at, t),
          key: `date-${dateKey(post.created_at)}`,
        });
      }
    }
    return result;
  }, [posts]);

  // 未読位置へスクロール (初回のみ)
  useEffect(() => {
    if (didScroll.current || !lastReadAt || items.length === 0) return;
    didScroll.current = true;

    // lastReadAt より新しい最初の投稿を探す (DESC 配列なので後ろから)
    let unreadIndex = -1;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.kind !== "post") continue;
      if (new Date(item.post.created_at) > new Date(lastReadAt)) {
        unreadIndex = i;
        break;
      }
    }

    if (unreadIndex > 0) {
      // 少し上 (=inverted で少し古い方) にオフセット
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: Math.min(unreadIndex + 1, items.length - 1),
          animated: false,
        });
      }, 100);
    }
  }, [lastReadAt, items]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.kind === "date") {
        return (
          <View style={s.dateRow}>
            <View
              style={[
                s.datePill,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <Text style={[s.dateText, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          </View>
        );
      }
      return (
        <TimelinePostCard
          post={item.post}
          onReply={onReply}
          memberMap={memberMap}
          showAvatar={item.showAvatar}
          showName={item.showName}
        />
      );
    },
    [onReply, memberMap, colors]
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  // inverted: onEndReached = スクロール上端 = 古い投稿読み込み
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        style={s.loader}
        size="small"
        color={colors.primary}
      />
    );
  }, [isFetchingNextPage, colors.primary]);

  const ListEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={s.empty}>
        <Text style={[s.emptyText, { color: colors.textSecondary }]}>
          {t("timeline.noPostsYet")}
        </Text>
      </View>
    );
  }, [isLoading, colors.textSecondary, t]);

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
        });
      }, 200);
    },
    []
  );

  return (
    <FlatList
      ref={listRef}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted
      ListEmptyComponent={ListEmpty}
      ListFooterComponent={ListFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={isRefetching}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      onScrollToIndexFailed={onScrollToIndexFailed}
    />
  );
}

const s = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dateRow: {
    alignItems: "center",
    paddingVertical: 10,
  },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loader: {
    paddingVertical: Spacing.lg,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl * 3,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
});
