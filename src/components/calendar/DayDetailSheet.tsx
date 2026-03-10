import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate, formatTime } from "@/utils/date";
import type { EventRow } from "@/types/events";

const SHEET_HEIGHT = 320;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface DayDetailSheetProps {
  visible: boolean;
  date: string;
  events: EventRow[];
  onClose: () => void;
  onEventPress: (event: EventRow) => void;
  onAddEvent: () => void;
}

export function DayDetailSheet({
  visible,
  date,
  events,
  onClose,
  onEventPress,
  onAddEvent,
}: DayDetailSheetProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80 || gesture.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  function openSheet() {
    isVisible.current = true;
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeSheet() {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isVisible.current = false;
      onClose();
    });
  }

  useEffect(() => {
    if (visible && !isVisible.current) {
      openSheet();
    } else if (!visible && isVisible.current) {
      closeSheet();
    }
  }, [visible]);

  const dateLabel = formatDate(date, "yyyy年M月d日");

  if (!visible && !isVisible.current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: scheme === "dark" ? "#1E1F23" : "#FFFFFF",
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Handle bar — draggable */}
        <View style={styles.handleBar} {...panResponder.panHandlers}>
          <View
            style={[
              styles.handle,
              {
                backgroundColor: scheme === "dark" ? "#555" : "#D0D0D0",
              },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {dateLabel}
          </Text>
          <TouchableOpacity onPress={closeSheet} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Events list */}
        <ScrollView
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
        >
          {events.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              {t("calendar.noEvents")}
            </Text>
          ) : (
            events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  { backgroundColor: (event as any).color || colors.primary },
                ]}
                onPress={() => onEventPress(event)}
                activeOpacity={0.8}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>
                  {event.all_day
                    ? t("calendar.allDay")
                    : `${formatTime(event.start_at)}〜${formatTime(event.end_at)}`}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Action button */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: scheme === "dark" ? "#2A2B30" : "#F5F5F5",
                borderColor: colors.border,
              },
            ]}
            onPress={onAddEvent}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {t("calendar.newEvent")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SHEET_HEIGHT,
    paddingBottom: 40,
  },
  handleBar: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  dateText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  eventsList: {
    paddingHorizontal: Spacing.lg,
    maxHeight: 200,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  eventCard: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  eventTime: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
