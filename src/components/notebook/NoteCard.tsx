import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/utils/date";

interface NoteCardProps {
  title: string;
  noteType: string;
  createdAt: string;
  isLocked: boolean;
  onPress: () => void;
}

export function NoteCard({
  title,
  noteType,
  createdAt,
  isLocked,
  onPress,
}: NoteCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {isLocked && (
            <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
          )}
        </View>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {formatDate(new Date(createdAt))}
        </Text>
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
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  meta: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
