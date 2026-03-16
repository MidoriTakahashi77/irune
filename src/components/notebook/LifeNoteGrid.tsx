import { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LIFE_NOTE_TEMPLATES } from "@/constants/lifenote-templates";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { NoteRow } from "@/types/events";

interface LifeNoteGridProps {
  notes: NoteRow[];
  onPress: (type: string, existingNoteId?: string) => void;
}

export const LifeNoteGrid = memo(function LifeNoteGrid({ notes, onPress }: LifeNoteGridProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <View style={styles.grid}>
      {LIFE_NOTE_TEMPLATES.map((template) => {
        const existing = notes.find((n) => n.note_type === template.type);
        const filled = !!existing;

        return (
          <TouchableOpacity
            key={template.type}
            style={[
              styles.cell,
              {
                backgroundColor: filled
                  ? colors.primary + "15"
                  : colors.backgroundElement,
                borderColor: filled ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onPress(template.type, existing?.id)}
          >
            <Ionicons
              name={template.icon as keyof typeof Ionicons.glyphMap}
              size={28}
              color={filled ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                { color: filled ? colors.primary : colors.text },
              ]}
              numberOfLines={2}
            >
              {t(template.titleKey)}
            </Text>
            {filled && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.primary}
                style={styles.check}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  cell: {
    width: "30%",
    flexGrow: 1,
    minWidth: 100,
    maxWidth: "48%",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    textAlign: "center",
  },
  check: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
