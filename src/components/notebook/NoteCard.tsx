import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/utils/date";

interface NoteCardProps {
  title: string;
  noteType: string;
  createdAt: string;
  isLocked: boolean;
  pageCount?: number;
  onPress: () => void;
}

export function NoteCard({
  title,
  noteType,
  createdAt,
  isLocked,
  pageCount,
  onPress,
}: NoteCardProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="book-outline" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {isLocked && (
            <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
          )}
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {formatDate(new Date(createdAt))}
          </Text>
          {pageCount != null && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {t("notebook.pages", { count: pageCount })}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  meta: {
    fontSize: FontSize.sm,
  },
});
