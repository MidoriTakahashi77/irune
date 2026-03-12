import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";

interface TimelineViewProps {
  items: Json[];
}

/**
 * Read-only timeline display for life history events.
 * Used in the detail/preview screen; the edit form uses RepeatableField.
 */
export function TimelineView({ items }: TimelineViewProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const lineColor = colors.border;
  const dotColor = colors.primary;

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const record = item as Record<string, Json>;
        const year = (record.year as string) ?? "";
        const age = (record.age as string) ?? "";
        const title = (record.title as string) ?? "";
        const detail = (record.detail as string) ?? "";
        const isLast = index === items.length - 1;

        return (
          <View key={index} style={styles.row}>
            <View style={styles.leftColumn}>
              <Text style={[styles.yearText, { color: colors.text }]}>{year}</Text>
              {age ? (
                <Text style={[styles.ageText, { color: colors.textSecondary }]}>{age}</Text>
              ) : null}
            </View>

            <View style={styles.lineColumn}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {!isLast && (
                <View style={[styles.line, { backgroundColor: lineColor }]} />
              )}
            </View>

            <View style={styles.contentColumn}>
              <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
              {detail ? (
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {detail}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    minHeight: 60,
  },
  leftColumn: {
    width: 60,
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
    paddingBottom: Spacing.md,
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
});
