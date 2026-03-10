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
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/hooks/useAuth";
import { useCreateEvent } from "@/hooks/useEvents";
import { useFamily } from "@/hooks/useFamily";
import { useCalendarStore } from "@/hooks/useCalendarStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { REMINDER_PRESETS } from "@/constants/reminders";
import { EVENT_COLORS } from "@/constants/eventColors";

type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly" | null;

const RECURRENCE_OPTIONS: { value: RecurrenceType; labelKey: string }[] = [
  { value: null, labelKey: "event.recurrenceNone" },
  { value: "daily", labelKey: "event.recurrenceDaily" },
  { value: "weekly", labelKey: "event.recurrenceWeekly" },
  { value: "monthly", labelKey: "event.recurrenceMonthly" },
  { value: "yearly", labelKey: "event.recurrenceYearly" },
];

export default function NewEventScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { selectedDate } = useCalendarStore();
  const createEvent = useCreateEvent();
  const { data: members = [] } = useFamily(profile?.family_id);

  const now = new Date();
  const currentHour = now.getHours();
  const defaultStartHour = String(currentHour).padStart(2, "0");
  const defaultEndHour = String(Math.min(currentHour + 1, 23)).padStart(
    2,
    "0"
  );

  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);

  const initialStart = new Date(`${selectedDate}T${defaultStartHour}:00:00`);
  const initialEnd = new Date(`${selectedDate}T${defaultEndHour}:00:00`);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startPickerMode, setStartPickerMode] = useState<"date" | "time">(
    "date"
  );
  const [endPickerMode, setEndPickerMode] = useState<"date" | "time">("date");

  const [notes, setNotes] = useState("");
  const [reminders, setReminders] = useState<number[]>([]);
  const [showCustomReminder, setShowCustomReminder] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [eventColor, setEventColor] = useState<string>(EVENT_COLORS[0]);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(null);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [error, setError] = useState("");

  function formatDateOnly(d: Date): string {
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }

  function formatTimeOnly(d: Date): string {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function toggleReminder(minutes: number) {
    setReminders((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes].sort((a, b) => a - b)
    );
  }

  function addCustomReminder() {
    const mins = parseInt(customMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    if (!reminders.includes(mins)) {
      setReminders((prev) => [...prev, mins].sort((a, b) => a - b));
    }
    setCustomMinutes("");
    setShowCustomReminder(false);
  }

  function toggleAssignee(memberId: string) {
    setAssignedTo((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError(t("event.titleRequired"));
      return;
    }
    if (!profile?.family_id) return;
    setError("");

    await createEvent.mutateAsync({
      title: title.trim(),
      family_id: profile.family_id,
      created_by: profile.id,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      all_day: allDay,
      notes: notes.trim() || null,
      reminders,
      color: eventColor,
      recurrence,
      assigned_to: assignedTo,
    });
    router.back();
  }

  function renderDatePicker(
    label: string,
    date: Date,
    setDate: (d: Date) => void,
    showPicker: boolean,
    setShowPicker: (v: boolean) => void,
    pickerMode: "date" | "time",
    setPickerMode: (m: "date" | "time") => void,
    showTime: boolean,
    minDate?: Date
  ) {
    return (
      <>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setPickerMode("date");
              setShowPicker(true);
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              {formatDateOnly(date)}
            </Text>
          </TouchableOpacity>
          {showTime && (
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                setPickerMode("time");
                setShowPicker(true);
              }}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                {formatTimeOnly(date)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {showPicker && (
          <>
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => setShowPicker(false)}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {t("event.done")}
                </Text>
              </TouchableOpacity>
            )}
            <DateTimePicker
              value={date}
              mode={showTime ? pickerMode : "date"}
              is24Hour
              locale="ja"
              minimumDate={minDate}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_: DateTimePickerEvent, d?: Date) => {
                if (Platform.OS === "android") setShowPicker(false);
                if (d) {
                  setDate(d);
                  if (
                    showTime &&
                    Platform.OS === "ios" &&
                    pickerMode === "date"
                  ) {
                    setPickerMode("time");
                  }
                }
              }}
            />
          </>
        )}
      </>
    );
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("event.create")}
            </Text>
            <View style={{ width: 80 }} />
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          <Input
            label={t("event.title")}
            placeholder={t("event.titlePlaceholder")}
            value={title}
            onChangeText={(text) => {
              setTitle(text.trimStart());
              if (error) setError("");
            }}
            autoFocus
          />

          {/* Color picker */}
          <Text style={[styles.label, { color: colors.text }]}>
            {t("event.color")}
          </Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                testID={`color-${c.replace("#", "")}`}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  eventColor === c && styles.colorSelected,
                ]}
                onPress={() => setEventColor(c)}
              >
                {eventColor === c && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
              {t("event.allDay")}
            </Text>
            <Switch value={allDay} onValueChange={setAllDay} />
          </View>

          {/* Start date/time */}
          {renderDatePicker(
            t("event.startDate"),
            startDate,
            (d) => {
              setStartDate(d);
              if (d > endDate) setEndDate(new Date(d.getTime() + 3600000));
            },
            showStartPicker,
            setShowStartPicker,
            startPickerMode,
            setStartPickerMode,
            !allDay
          )}

          {/* End date/time */}
          {renderDatePicker(
            t("event.endDate"),
            endDate,
            setEndDate,
            showEndPicker,
            setShowEndPicker,
            endPickerMode,
            setEndPickerMode,
            !allDay,
            startDate
          )}

          {/* Recurrence */}
          <Text style={[styles.label, { color: colors.text }]}>
            {t("event.recurrence")}
          </Text>
          <View style={styles.chipGrid}>
            {RECURRENCE_OPTIONS.map((opt) => {
              const isActive = recurrence === opt.value;
              return (
                <TouchableOpacity
                  key={opt.labelKey}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.backgroundElement,
                    },
                  ]}
                  onPress={() => setRecurrence(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? "#FFFFFF" : colors.text },
                    ]}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Assignee */}
          <Text style={[styles.label, { color: colors.text }]}>
            {t("event.assignee")}
          </Text>
          <View style={styles.chipGrid}>
            {members.map((member: any) => {
              const isActive = assignedTo.includes(member.id);
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive
                        ? member.color || colors.primary
                        : colors.backgroundElement,
                    },
                  ]}
                  onPress={() => toggleAssignee(member.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? "#FFFFFF" : colors.text },
                    ]}
                  >
                    {member.display_name}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label={t("event.notes")}
            placeholder={t("event.notesPlaceholder")}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: "top" }}
          />

          <View style={styles.reminderSection}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t("event.reminder")}
            </Text>
            <View style={styles.chipGrid}>
              {REMINDER_PRESETS.map((preset) => {
                const isActive = reminders.includes(preset.minutes);
                return (
                  <TouchableOpacity
                    key={preset.minutes}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : colors.backgroundElement,
                      },
                    ]}
                    onPress={() => toggleReminder(preset.minutes)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isActive ? "#FFFFFF" : colors.text },
                      ]}
                    >
                      {t(preset.labelKey)}
                    </Text>
                    {isActive && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => setShowCustomReminder(!showCustomReminder)}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {t("event.reminderCustom")}
                </Text>
                <Ionicons name="add" size={14} color={colors.text} />
              </TouchableOpacity>
            </View>

            {showCustomReminder && (
              <View style={styles.customReminderRow}>
                <Input
                  label=""
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="number-pad"
                  placeholder="15"
                  style={{ flex: 1 }}
                />
                <Text
                  style={[
                    styles.customMinLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("event.reminderMinutes")}
                </Text>
                <Button
                  title={t("common.save")}
                  onPress={addCustomReminder}
                  variant="secondary"
                />
              </View>
            )}

            {reminders.length > 0 && (
              <View style={styles.selectedReminders}>
                {reminders
                  .filter(
                    (m) => !REMINDER_PRESETS.some((p) => p.minutes === m)
                  )
                  .map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={() => toggleReminder(m)}
                    >
                      <Text style={[styles.chipText, { color: "#FFFFFF" }]}>
                        {m}
                        {t("event.reminderMinutes")}
                      </Text>
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>

          <Button
            title={t("event.save")}
            onPress={handleSubmit}
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
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  dateButtonText: {
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  pickerDone: {
    alignSelf: "flex-end",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.lg,
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  reminderSection: {
    marginBottom: Spacing.lg,
  },
  customReminderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  customMinLabel: {
    fontSize: FontSize.sm,
  },
  selectedReminders: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
