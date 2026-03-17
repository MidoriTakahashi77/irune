import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { VisibilityMode } from "@/types/events";

interface Member {
  id: string;
  display_name: string;
  color?: string;
}

interface VisibilityPickerProps {
  mode: VisibilityMode;
  selectedIds: string[];
  members: Member[];
  onChange: (mode: VisibilityMode, selectedIds: string[]) => void;
  compact?: boolean;
}

export function VisibilityPicker({
  mode,
  selectedIds,
  members,
  onChange,
  compact,
}: VisibilityPickerProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [visible, setVisible] = useState(false);
  const [tempMode, setTempMode] = useState(mode);
  const [tempIds, setTempIds] = useState(selectedIds);

  function open() {
    setTempMode(mode);
    setTempIds(selectedIds);
    setVisible(true);
  }

  function confirm() {
    onChange(tempMode, tempMode === "custom" ? tempIds : []);
    setVisible(false);
  }

  function toggleMember(id: string) {
    setTempIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const label =
    mode === "all"
      ? t("visibility.everyone")
      : mode === "owner"
        ? t("visibility.ownerOnly")
        : t("visibility.custom");

  const icon =
    mode === "all" ? "people" : mode === "owner" ? "lock-closed" : "people-circle";

  return (
    <>
      <TouchableOpacity
        style={[
          compact ? styles.triggerCompact : styles.trigger,
          { backgroundColor: colors.backgroundElement, borderColor: colors.border },
        ]}
        onPress={open}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={compact ? 16 : 18}
          color={mode === "owner" ? colors.warning : colors.primary}
        />
        <Text
          style={[
            compact ? styles.triggerTextCompact : styles.triggerText,
            { color: colors.text },
          ]}
        >
          {label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {t("visibility.selectMembers")}
            </Text>

            {/* モード選択 */}
            <View style={styles.modeList}>
              {(["all", "owner", "custom"] as VisibilityMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modeRow,
                    { borderColor: tempMode === m ? colors.primary : colors.border },
                    tempMode === m && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setTempMode(m)}
                >
                  <Ionicons
                    name={
                      tempMode === m ? "radio-button-on" : "radio-button-off"
                    }
                    size={20}
                    color={tempMode === m ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.modeLabel, { color: colors.text }]}>
                    {t(
                      m === "all"
                        ? "visibility.everyone"
                        : m === "owner"
                          ? "visibility.ownerOnly"
                          : "visibility.custom"
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* カスタムの場合のメンバー選択 */}
            {tempMode === "custom" && (
              <ScrollView style={styles.memberList}>
                {members.map((member) => {
                  const selected = tempIds.includes(member.id);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.memberRow}
                      onPress={() => toggleMember(member.id)}
                    >
                      <View
                        style={[
                          styles.memberAvatar,
                          { backgroundColor: member.color ?? colors.primary },
                        ]}
                      >
                        <Text style={styles.memberAvatarText}>
                          {member.display_name?.[0] ?? "?"}
                        </Text>
                      </View>
                      <Text style={[styles.memberName, { color: colors.text }]}>
                        {member.display_name}
                      </Text>
                      <Ionicons
                        name={selected ? "checkbox" : "square-outline"}
                        size={22}
                        color={selected ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={confirm}
            >
              <Text style={styles.confirmText}>{t("visibility.confirm")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: FontSize.md,
    fontWeight: "500",
    flex: 1,
  },
  triggerTextCompact: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  modeList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeLabel: {
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  memberList: {
    maxHeight: 240,
    marginBottom: Spacing.md,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.sm,
    fontWeight: "bold",
  },
  memberName: {
    flex: 1,
    fontSize: FontSize.md,
  },
  confirmButton: {
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 12,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "bold",
  },
});
