import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { TimelineView } from "@/components/notebook/TimelineView";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";
import type { LifeNoteTemplate, LifeNoteBody, FieldDefinition } from "@/types/notes";

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
          {section.descriptionKey && (
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              {t(section.descriptionKey)}
            </Text>
          )}
          {section.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              values={values}
              onChange={onChange}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function FieldRenderer({
  field,
  values,
  onChange,
}: {
  field: FieldDefinition;
  values: LifeNoteBody;
  onChange: (key: string, value: Json) => void;
}) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  if (field.type === "boolean") {
    return (
      <View style={styles.switchRow}>
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
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textSecondary }]}>
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
                    backgroundColor: selected ? colors.primary : colors.backgroundElement,
                    color: selected ? "#FFFFFF" : colors.text,
                    borderColor: selected ? colors.primary : colors.border,
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

  if (field.type === "repeatable" && field.fields) {
    const items = (values[field.key] as Json[] | undefined) ?? [];
    const hasTimelineFields = field.fields.some((f) => f.key === "year") &&
      field.fields.some((f) => f.key === "title");
    return (
      <>
        {hasTimelineFields && items.length > 0 && (
          <TimelineView items={items} />
        )}
        <RepeatableField
          field={field}
          items={items}
          onChange={(items) => onChange(field.key, items)}
        />
      </>
    );
  }

  return (
    <Input
      label={t(field.labelKey)}
      value={(values[field.key] as string) ?? ""}
      onChangeText={(v) => onChange(field.key, v)}
      placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
      multiline={field.type === "textarea"}
      style={
        field.type === "textarea"
          ? { minHeight: 80, textAlignVertical: "top" }
          : undefined
      }
    />
  );
}

function RepeatableField({
  field,
  items,
  onChange,
}: {
  field: FieldDefinition;
  items: Json[];
  onChange: (items: Json[]) => void;
}) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const subFields = field.fields!;

  function addItem() {
    const empty: Record<string, string> = {};
    for (const sf of subFields) {
      empty[sf.key] = "";
    }
    onChange([...items, empty]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, subKey: string, value: Json) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      return { ...(item as Record<string, Json>), [subKey]: value };
    });
    onChange(updated);
  }

  return (
    <View style={styles.repeatableContainer}>
      <Text style={[styles.repeatableLabel, { color: colors.text }]}>
        {t(field.labelKey)}
      </Text>

      {items.map((item, index) => {
        const record = item as Record<string, Json>;
        return (
          <Card key={index} style={styles.repeatableCard}>
            <View style={styles.repeatableHeader}>
              <Text style={[styles.repeatableIndex, { color: colors.textSecondary }]}>
                {index + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeItem(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
            {subFields.map((sf) => {
              if (sf.type === "select" && sf.options) {
                return (
                  <View key={sf.key} style={styles.subSelectContainer}>
                    <Text style={[styles.selectLabel, { color: colors.textSecondary }]}>
                      {t(sf.labelKey)}
                    </Text>
                    <View style={styles.selectRow}>
                      {sf.options.map((opt) => {
                        const selected = record[sf.key] === opt;
                        return (
                          <Text
                            key={opt}
                            onPress={() => updateItem(index, sf.key, opt)}
                            style={[
                              styles.selectOption,
                              {
                                backgroundColor: selected ? colors.primary : colors.backgroundElement,
                                color: selected ? "#FFFFFF" : colors.text,
                                borderColor: selected ? colors.primary : colors.border,
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
              );
            })}
          </Card>
        );
      })}

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
  sectionDescription: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
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
  repeatableContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  repeatableLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  repeatableCard: {
    gap: Spacing.xs,
  },
  repeatableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  repeatableIndex: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  subSelectContainer: {
    marginBottom: Spacing.xs,
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
