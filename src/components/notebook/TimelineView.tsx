import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";
import type { Json } from "@/types/database";
import type { FieldDefinition } from "@/types/notes";

interface TimelineEditorProps {
  field: FieldDefinition;
  items: Json[];
  onChange: (items: Json[]) => void;
  birthYear?: number;
}

export function TimelineEditor({ field, items, onChange, birthYear }: TimelineEditorProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const subFields = field.fields!;

  function addItem() {
    const empty: Record<string, string> = {};
    for (const sf of subFields) {
      empty[sf.key] = "";
    }
    const newIndex = items.length;
    onChange([...items, empty]);
    setEditingIndex(newIndex);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setEditingIndex(null);
  }

  function updateItem(index: number, subKey: string, value: string) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const record = { ...(item as Record<string, Json>), [subKey]: value };
      if (birthYear && (subKey === "year" || subKey === "age")) {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          if (subKey === "year") {
            record.age = String(num - birthYear);
          } else {
            record.year = String(birthYear + num);
          }
        }
      }
      return record;
    });
    onChange(updated);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t(field.labelKey)}
      </Text>

      {items.length > 0 && (
        <View style={styles.timeline}>
          {items.map((item, index) => {
            const record = item as Record<string, Json>;
            const year = (record.year as string) ?? "";
            const age = (record.age as string) ?? "";
            const title = (record.title as string) ?? "";
            const detail = (record.detail as string) ?? "";
            const isLast = index === items.length - 1;
            const isEditing = editingIndex === index;

            return (
              <View key={index}>
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.6}
                  onPress={() => setEditingIndex(isEditing ? null : index)}
                >
                  <View style={styles.leftColumn}>
                    <Text style={[styles.yearText, { color: colors.text }]}>{year}</Text>
                    {age ? (
                      <Text style={[styles.ageText, { color: colors.textSecondary }]}>
                        {age}歳
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.lineColumn}>
                    <View style={[
                      styles.dot,
                      { backgroundColor: isEditing ? colors.primary : colors.border },
                    ]} />
                    {!isLast && (
                      <View style={[styles.line, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  <View style={styles.contentColumn}>
                    <Text style={[styles.titleText, { color: colors.text }]}>
                      {title || t("lifenote.fields.eventTitle")}
                    </Text>
                    {detail && !isEditing ? (
                      <Text
                        style={[styles.detailText, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {detail}
                      </Text>
                    ) : null}
                  </View>

                  <Ionicons
                    name={isEditing ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.textSecondary}
                    style={styles.chevron}
                  />
                </TouchableOpacity>

                {isEditing && (
                  <Card style={styles.editCard}>
                    <View style={styles.editCardHeader}>
                      <TouchableOpacity
                        onPress={() => removeItem(index)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    {subFields.map((sf) => (
                      <Input
                        key={sf.key}
                        label={t(sf.labelKey)}
                        value={(record[sf.key] as string) ?? ""}
                        onChangeText={(v) => updateItem(index, sf.key, v)}
                        placeholder={sf.placeholderKey ? t(sf.placeholderKey) : undefined}
                        multiline={sf.type === "textarea"}
                        style={
                          sf.type === "textarea"
                            ? { minHeight: 60, textAlignVertical: "top" }
                            : undefined
                        }
                      />
                    ))}
                  </Card>
                )}
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { borderColor: colors.primary }]}
        onPress={addItem}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.addButtonText, { color: colors.primary }]}>
          {t("lifenote.addItem")}
        </Text>
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
  timeline: {
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 50,
  },
  leftColumn: {
    width: 55,
    alignItems: "flex-end",
    paddingRight: Spacing.sm,
    paddingTop: 2,
  },
  yearText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  ageText: {
    fontSize: FontSize.sm - 2,
  },
  lineColumn: {
    width: 20,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  titleText: {
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  detailText: {
    fontSize: FontSize.sm,
    marginTop: 2,
    lineHeight: 20,
  },
  chevron: {
    marginTop: 4,
    marginRight: Spacing.xs,
  },
  editCard: {
    marginLeft: 75,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  editCardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
