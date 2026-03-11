import { View, Text, StyleSheet, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";
import type { LifeNoteTemplate, LifeNoteBody } from "@/types/notes";

interface TemplateFormRendererProps {
  template: LifeNoteTemplate;
  values: LifeNoteBody;
  onChange: (key: string, value: Json) => void;
}

export function TemplateFormRenderer({
  template,
  values,
  onChange,
}: TemplateFormRendererProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <View style={styles.container}>
      {template.sections.map((section) => (
        <View key={section.titleKey} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t(section.titleKey)}
          </Text>
          {section.fields.map((field) => {
            if (field.type === "boolean") {
              return (
                <View key={field.key} style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>
                    {t(field.labelKey)}
                  </Text>
                  <Switch
                    value={!!values[field.key]}
                    onValueChange={(v) => onChange(field.key, v)}
                    trackColor={{ true: colors.primary }}
                  />
                </View>
              );
            }

            if (field.type === "select" && field.options) {
              return (
                <View key={field.key} style={styles.selectContainer}>
                  <Text
                    style={[styles.selectLabel, { color: colors.textSecondary }]}
                  >
                    {t(field.labelKey)}
                  </Text>
                  <View style={styles.selectRow}>
                    {field.options.map((opt) => {
                      const selected = values[field.key] === opt;
                      return (
                        <Text
                          key={opt}
                          onPress={() => onChange(field.key, opt)}
                          style={[
                            styles.selectOption,
                            {
                              backgroundColor: selected
                                ? colors.primary
                                : colors.backgroundElement,
                              color: selected ? "#FFFFFF" : colors.text,
                              borderColor: selected
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                        >
                          {t(`lifenote.options.${opt}`, opt)}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              );
            }

            return (
              <Input
                key={field.key}
                label={t(field.labelKey)}
                value={(values[field.key] as string) ?? ""}
                onChangeText={(v) => onChange(field.key, v)}
                multiline={field.type === "textarea"}
                style={
                  field.type === "textarea"
                    ? { minHeight: 80, textAlignVertical: "top" }
                    : undefined
                }
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    fontSize: FontSize.md,
  },
  selectContainer: {
    marginBottom: Spacing.md,
  },
  selectLabel: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  selectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  selectOption: {
    fontSize: FontSize.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
});
