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
  onSave: () => void;
  label: string;
  addLabel: string;
  saveLabel: string;
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
  onSave,
  label,
  addLabel,
  saveLabel,
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

  const paperBg = scheme === "light" ? "#FFFEF5" : "#2A2820";
  const lineColor = scheme === "light" ? "#E8E4D4" : "#3A3830";
  const envelopeBg = scheme === "light" ? "#FAF8F2" : "#252320";
  const envelopeBorder = scheme === "light" ? "#D4C9A8" : "#4A4538";
  const stampColor = scheme === "light" ? "#C4735B" : "#A85D48";

  function addItem() {
    const newIndex = items.length;
    onChange([...items, { recipient: "", relationship: "", message: "" }]);
    setEditingIndex(newIndex);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setEditingIndex(null);
  }

  function saveLetter() {
    setEditingIndex(null);
    onSave();
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
              style={[styles.editCard, { backgroundColor: paperBg, borderColor: colors.primary }]}
            >
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
              <View style={styles.editFooter}>
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveLetter}
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.saveButtonText}>{saveLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        // 封筒モード
        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => setEditingIndex(index)}
            style={[styles.envelope, { backgroundColor: envelopeBg, borderColor: envelopeBorder }]}
          >
            {/* 切手風マーク */}
            <View style={[styles.stamp, { borderColor: stampColor }]}>
              <Ionicons name="mail" size={16} color={stampColor} />
            </View>
            <View style={styles.envelopeBody}>
              <Text style={[styles.envelopeTo, { color: colors.textSecondary }]}>To:</Text>
              <Text style={[styles.envelopeRecipient, { color: colors.text }]}>
                {record.recipient || "—"}
              </Text>
              {record.relationship ? (
                <Text style={[styles.envelopeRelation, { color: colors.textSecondary }]}>
                  {record.relationship}
                </Text>
              ) : null}
            </View>
            {record.message ? (
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            ) : null}
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
  // 封筒カード
  envelope: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  stamp: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  envelopeBody: {
    flex: 1,
    gap: 2,
  },
  envelopeTo: {
    fontSize: 11,
    fontStyle: "italic",
  },
  envelopeRecipient: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  envelopeRelation: {
    fontSize: FontSize.sm,
  },
  // 編集カード
  editCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: Spacing.md,
    gap: Spacing.sm,
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
  editFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  deleteButton: {
    padding: 8,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.sm,
    fontWeight: "600",
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
