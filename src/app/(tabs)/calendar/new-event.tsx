import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/hooks/useAuth";
import { useCreateEvent } from "@/hooks/useEvents";
import { useCalendarStore } from "@/hooks/useCalendarStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { CATEGORY_CONFIG, CATEGORIES } from "@/constants/categories";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { eventSchema, type EventFormData } from "@/utils/validation";

export default function NewEventScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { selectedDate } = useCalendarStore();
  const createEvent = useCreateEvent();

  const now = new Date();
  const defaultStart = `${selectedDate}T${String(now.getHours()).padStart(2, "0")}:00:00`;
  const defaultEnd = `${selectedDate}T${String(now.getHours() + 1).padStart(2, "0")}:00:00`;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      category: "family",
      start_at: defaultStart,
      end_at: defaultEnd,
      all_day: false,
      notes: "",
      reminder: false,
      reminder_minutes: 30,
    },
  });

  async function onSubmit(data: EventFormData) {
    if (!profile?.family_id) return;
    await createEvent.mutateAsync({
      ...data,
      family_id: profile.family_id,
      created_by: profile.id,
    });
    router.back();
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Button
              title={t("common.cancel")}
              onPress={() => router.back()}
              variant="ghost"
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {t("event.create")}
            </Text>
            <View style={{ width: 80 }} />
          </View>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("event.title")}
                placeholder={t("event.titlePlaceholder")}
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                <Text
                  style={[styles.label, { color: colors.textSecondary }]}
                >
                  {t("event.category")}
                </Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => {
                    const config = CATEGORY_CONFIG[cat];
                    const isSelected = value === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: isSelected
                              ? config.color
                              : colors.backgroundElement,
                          },
                        ]}
                        onPress={() => onChange(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            {
                              color: isSelected ? "#FFFFFF" : colors.text,
                            },
                          ]}
                        >
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="all_day"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("event.allDay")}
                </Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />

          <Controller
            control={control}
            name="start_at"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("event.startDate")}
                value={value.replace("T", " ").slice(0, 16)}
                onChangeText={(text) => onChange(text)}
                placeholder="2024-01-01 09:00"
              />
            )}
          />

          <Controller
            control={control}
            name="end_at"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("event.endDate")}
                value={value.replace("T", " ").slice(0, 16)}
                onChangeText={(text) => onChange(text)}
                placeholder="2024-01-01 10:00"
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("event.notes")}
                placeholder={t("event.notesPlaceholder")}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: "top" }}
              />
            )}
          />

          <Controller
            control={control}
            name="reminder"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("event.reminder")}
                </Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />

          <Button
            title={t("event.save")}
            onPress={handleSubmit(onSubmit)}
            loading={createEvent.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  categoryContainer: {
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
