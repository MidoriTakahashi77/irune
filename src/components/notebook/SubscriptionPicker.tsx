import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_PRESETS,
  type SubscriptionCategory,
} from "@/constants/subscription-presets";
import type { Json } from "@/types/database";

interface SubscriptionPickerProps {
  onSelect: (service: string) => void;
  onClose: () => void;
  existingServices: string[];
}

export function SubscriptionPicker({
  onSelect,
  onClose,
  existingServices,
}: SubscriptionPickerProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory>("video");

  const filteredPresets = SUBSCRIPTION_PRESETS.filter(
    (p) => p.category === selectedCategory
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("lifenote.subscriptionPicker.title", "サービスを選択")}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeText, { color: colors.primary }]}>
            {t("common.close", "閉じる")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {SUBSCRIPTION_CATEGORIES.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? colors.primary : colors.background,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: active ? "#FFFFFF" : colors.text },
                ]}
              >
                {t(`lifenote.subscriptionPicker.categories.${cat}`, cat)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.presetGrid}>
        {filteredPresets.map((preset) => {
          const alreadyAdded = existingServices.includes(preset.name);
          return (
            <TouchableOpacity
              key={preset.name}
              style={[
                styles.presetChip,
                {
                  backgroundColor: alreadyAdded ? colors.backgroundSelected : colors.background,
                  borderColor: alreadyAdded ? colors.textSecondary : colors.border,
                },
              ]}
              onPress={() => {
                if (!alreadyAdded) {
                  onSelect(preset.name);
                }
              }}
              disabled={alreadyAdded}
            >
              <Text
                style={[
                  styles.presetText,
                  { color: alreadyAdded ? colors.textSecondary : colors.text },
                ]}
              >
                {preset.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** Extract existing service names from repeatable subscription items */
export function getExistingServiceNames(items: Json[]): string[] {
  return items
    .map((item) => {
      const record = item as Record<string, Json>;
      return (record.service as string) ?? "";
    })
    .filter(Boolean);
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  closeText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  categoryRow: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: FontSize.sm,
  },
});
