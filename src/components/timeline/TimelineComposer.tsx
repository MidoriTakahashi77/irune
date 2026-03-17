import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/useTimeline";
import type { TimelinePostWithDetails, ProfileRow } from "@/types/events";

export interface QuoteReplyContext {
  post: TimelinePostWithDetails;
}

interface TimelineComposerProps {
  replyContext?: QuoteReplyContext | null;
  onClearReply?: () => void;
  members: Pick<ProfileRow, "id" | "display_name" | "color">[];
}

export function TimelineComposer({
  replyContext,
  onClearReply,
  members,
}: TimelineComposerProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user, profile } = useAuth();
  const createPost = useCreatePost();
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIds, setMentionIds] = useState<string[]>([]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    const lastAt = newText.lastIndexOf("@");
    if (lastAt >= 0) {
      const afterAt = newText.slice(lastAt + 1);
      if (!/[\s\n]/.test(afterAt)) {
        setMentionQuery(afterAt.toLowerCase());
        return;
      }
    }
    setMentionQuery(null);
  }, []);

  const handleSelectMention = useCallback(
    (member: Pick<ProfileRow, "id" | "display_name" | "color">) => {
      const lastAt = text.lastIndexOf("@");
      if (lastAt < 0) return;
      const before = text.slice(0, lastAt);
      setText(`${before}@${member.display_name} `);
      setMentionQuery(null);
      if (!mentionIds.includes(member.id)) {
        setMentionIds((prev) => [...prev, member.id]);
      }
      inputRef.current?.focus();
    },
    [text, mentionIds]
  );

  const filteredMembers =
    mentionQuery !== null
      ? members.filter(
          (m) =>
            m.id !== user?.id &&
            m.display_name.toLowerCase().includes(mentionQuery)
        )
      : [];

  const handleSubmit = useCallback(() => {
    if (!text.trim() || !user || !profile?.family_id) return;
    createPost.mutate(
      {
        family_id: profile.family_id,
        author_id: user.id,
        type: "post",
        body: text.trim(),
        reply_to_id: replyContext?.post.id ?? undefined,
        mentions: mentionIds.length > 0 ? mentionIds : undefined,
      },
      {
        onSuccess: () => {
          setText("");
          setMentionIds([]);
          onClearReply?.();
        },
      }
    );
  }, [text, user, profile, createPost, replyContext, mentionIds, onClearReply]);

  const replyPost = replyContext?.post;
  const canSend = text.trim().length > 0 && !createPost.isPending;

  return (
    <View style={[s.wrapper, { borderTopColor: colors.border }]}>
      {/* メンション候補 */}
      {filteredMembers.length > 0 && (
        <View style={[s.mentionList, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <FlatList
            data={filteredMembers}
            keyExtractor={(m) => m.id}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.mentionItem}
                onPress={() => handleSelectMention(item)}
              >
                <View style={[s.mentionAvatar, { backgroundColor: item.color }]}>
                  <Text style={s.mentionAvatarText}>
                    {item.display_name.charAt(0)}
                  </Text>
                </View>
                <Text style={[s.mentionName, { color: colors.text }]}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 引用プレビュー */}
      {replyPost && (
        <View style={[s.replyBar, { backgroundColor: colors.backgroundElement }]}>
          <View
            style={[s.replyAccent, { backgroundColor: replyPost.profiles?.color ?? colors.primary }]}
          />
          <View style={s.replyContent}>
            <Text style={[s.replyName, { color: replyPost.profiles?.color ?? colors.primary }]}>
              {replyPost.profiles?.display_name ?? "?"}
            </Text>
            <Text style={[s.replyBody, { color: colors.textSecondary }]} numberOfLines={1}>
              {replyPost.type === "post" ? replyPost.body : replyPost.ref_summary ?? ""}
            </Text>
          </View>
          <TouchableOpacity onPress={onClearReply} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* 入力バー */}
      <View style={[s.inputRow, { backgroundColor: colors.background }]}>
        <View style={[s.inputField, { backgroundColor: colors.backgroundElement }]}>
          <TextInput
            ref={inputRef}
            style={[s.input, { color: colors.text }]}
            placeholder={t("timeline.composer")}
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />
        </View>

        <TouchableOpacity
          style={[
            s.sendButton,
            { backgroundColor: canSend ? colors.text : colors.backgroundSelected },
          ]}
          onPress={handleSubmit}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={canSend ? colors.background : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mentionList: {
    maxHeight: 160,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mentionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mentionAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  mentionAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  mentionName: {
    fontSize: 15,
    fontWeight: "500",
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyAccent: {
    width: 3,
    height: "100%",
    borderRadius: 1.5,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: "700",
  },
  replyBody: {
    fontSize: 13,
    marginTop: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  inputField: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
