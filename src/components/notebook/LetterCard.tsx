import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";

interface LetterItem {
  recipient: string;
  relationship: string;
  message: string;
}

interface LetterListProps {
  items: Json[];
  onChange: (items: Json[]) => void;
  label: string;
  addLabel: string;
  recipientLabel: string;
  relationshipLabel: string;
  messageLabel: string;
  recipientPlaceholder?: string;
  relationshipPlaceholder?: string;
  messagePlaceholder?: string;
  emptyMessage: string;
}

export function LetterList({
  items,
  onChange,
  label,
  addLabel,
  recipientLabel,
  relationshipLabel,
  messageLabel,
  recipientPlaceholder,
  relationshipPlaceholder,
  messagePlaceholder,
  emptyMessage,
}: LetterListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const bgColor = scheme === "light" ? "#FFFEF5" : "#2A2820";
  const lineColor = scheme === "light" ? "#E8E4D4" : "#3A3830";

  function addItem() {
    const newIndex = items.length;
    onChange([...items, { recipient: "", relationship: "", message: "" }]);
    setEditingIndex(newIndex);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setEditingIndex(null);
  }

  function updateField(index: number, key: string, value: string) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return { ...(item as Record<string, Json>), [key]: value };
    });
    onChange(updated);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      {items.length === 0 && (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {emptyMessage}
        </Text>
      )}

      {items.map((item, index) => {
        const record = item as unknown as LetterItem;
        const isEditing = editingIndex === index;

        if (isEditing) {
          return (
            <View
              key={index}
              style={[styles.editCard, { backgroundColor: bgColor, borderColor: colors.primary }]}
            >
              <View style={styles.editHeader}>
                <TouchableOpacity
                  onPress={() => setEditingIndex(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.toRow}>
                <Text style={[styles.toLabel, { color: colors.textSecondary }]}>To:</Text>
                <View style={styles.toInputs}>
                  <Input
                    label={recipientLabel}
                    value={record.recipient ?? ""}
                    onChangeText={(v) => updateField(index, "recipient", v)}
                    placeholder={recipientPlaceholder}
                  />
                  <Input
                    label={relationshipLabel}
                    value={record.relationship ?? ""}
                    onChangeText={(v) => updateField(index, "relationship", v)}
                    placeholder={relationshipPlaceholder}
                  />
                </View>
              </View>
              <View style={[styles.separator, { borderColor: lineColor }]} />
              <Input
                label={messageLabel}
                value={record.message ?? ""}
                onChangeText={(v) => updateField(index, "message", v)}
                placeholder={messagePlaceholder}
                multiline
                style={{ minHeight: 120, textAlignVertical: "top" }}
              />
            </View>
          );
        }

        // 表示モード：手紙らしいカード
        const hasContent = record.recipient || record.message;
        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => setEditingIndex(index)}
            style={[styles.displayCard, { backgroundColor: bgColor, borderColor: lineColor }]}
          >
            <View style={styles.displayHeader}>
              <Text style={[styles.displayTo, { color: colors.textSecondary }]}>To:</Text>
              <Text style={[styles.displayRecipient, { color: colors.text }]}>
                {record.recipient || "—"}
                {record.relationship ? ` (${record.relationship})` : ""}
              </Text>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
            </View>
            <View style={[styles.separator, { borderColor: lineColor }]} />
            <Text
              style={[
                styles.displayMessage,
                { color: hasContent ? colors.text : colors.textSecondary },
              ]}
              numberOfLines={3}
            >
              {record.message || messagePlaceholder || ""}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.addButton, { borderColor: colors.primary }]}
        onPress={addItem}
      >
        <Ionicons name="mail-outline" size={20} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>{addLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  displayCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  displayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  displayTo: {
    fontSize: FontSize.md,
    fontWeight: "600",
    fontStyle: "italic",
  },
  displayRecipient: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  displayMessage: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  editCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  toLabel: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    fontStyle: "italic",
    paddingTop: 28,
  },
  toInputs: {
    flex: 1,
    gap: Spacing.xs,
  },
  separator: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
