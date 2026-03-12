import { useRef, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform, type ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";
import type { LifeNoteTemplate, LifeNoteBody, FieldDefinition } from "@/types/notes";

interface TemplateFormRendererProps {
  template: LifeNoteTemplate;
  values: LifeNoteBody;
  onChange: (key: string, value: Json) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function TemplateFormRenderer({
  template,
  values,
  onChange,
  scrollViewRef,
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
              scrollViewRef={scrollViewRef}
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
  scrollViewRef,
}: {
  field: FieldDefinition;
  values: LifeNoteBody;
  onChange: (key: string, value: Json) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
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
    return (
      <RepeatableField
        field={field}
        items={(values[field.key] as Json[] | undefined) ?? []}
        onChange={(items) => onChange(field.key, items)}
      />
    );
  }

  if (field.type === "date") {
    return (
      <DateField
        field={field}
        value={(values[field.key] as string) ?? ""}
        onChange={(v) => onChange(field.key, v)}
        scrollViewRef={scrollViewRef}
      />
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

function DateField({
  field,
  value,
  onChange,
  scrollViewRef,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<View>(null);

  const currentDate = value ? new Date(value) : undefined;

  function formatDisplayDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function handleOpen() {
    const opening = !showPicker;
    setShowPicker(opening);
    if (opening) {
      setTimeout(() => {
        pickerRef.current?.measureLayout(
          scrollViewRef?.current?.getInnerViewNode?.() ?? (scrollViewRef?.current as any),
          (_x: number, y: number) => {
            scrollViewRef?.current?.scrollTo({ y: y - 40, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  }

  function handleChange(_: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${y}-${m}-${d}`);
    }
  }

  return (
    <View style={styles.dateContainer}>
      <Text style={[styles.selectLabel, { color: colors.textSecondary }]}>
        {t(field.labelKey)}
      </Text>
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: showPicker ? colors.primary : colors.border,
            borderWidth: showPicker ? 2 : 1,
          },
        ]}
        onPress={handleOpen}
      >
        <Ionicons name="calendar-outline" size={20} color={showPicker ? colors.primary : colors.textSecondary} />
        <Text
          style={[
            styles.dateButtonText,
            { color: value ? colors.text : colors.textSecondary },
          ]}
        >
          {value
            ? formatDisplayDate(value)
            : field.placeholderKey
              ? t(field.placeholderKey)
              : ""}
        </Text>
      </TouchableOpacity>
      <View ref={pickerRef}>
        {showPicker && (
          <DateTimePicker
            value={currentDate ?? new Date(1990, 0, 1)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            locale="ja"
            maximumDate={new Date()}
            onChange={handleChange}
          />
        )}
      </View>
      {Platform.OS === "ios" && showPicker && (
        <TouchableOpacity
          style={[styles.dateConfirmButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowPicker(false)}
        >
          <Text style={styles.dateConfirmText}>{t("common.done", "完了")}</Text>
        </TouchableOpacity>
      )}
    </View>
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
  dateContainer: {
    marginBottom: Spacing.md,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: FontSize.md,
  },
  dateConfirmButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: Spacing.xs,
  },
  dateConfirmText: {
    color: "#FFFFFF",
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
