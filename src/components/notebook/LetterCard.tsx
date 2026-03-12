import { View, Text, StyleSheet } from "react-native";
import { Input } from "@/components/ui/Input";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Json } from "@/types/database";

interface LetterCardProps {
  recipient: string;
  relationship: string;
  message: string;
  onChangeRecipient: (v: string) => void;
  onChangeRelationship: (v: string) => void;
  onChangeMessage: (v: string) => void;
  recipientLabel: string;
  relationshipLabel: string;
  messageLabel: string;
  recipientPlaceholder?: string;
  relationshipPlaceholder?: string;
  messagePlaceholder?: string;
}

export function LetterCard({
  recipient,
  relationship,
  message,
  onChangeRecipient,
  onChangeRelationship,
  onChangeMessage,
  recipientLabel,
  relationshipLabel,
  messageLabel,
  recipientPlaceholder,
  relationshipPlaceholder,
  messagePlaceholder,
}: LetterCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const bgColor = scheme === "light" ? "#FFFEF5" : "#2A2820";
  const lineColor = scheme === "light" ? "#E8E4D4" : "#3A3830";

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: lineColor }]}>
      <View style={styles.toRow}>
        <Text style={[styles.toLabel, { color: colors.textSecondary }]}>To:</Text>
        <View style={styles.toInputs}>
          <Input
            label={recipientLabel}
            value={recipient}
            onChangeText={onChangeRecipient}
            placeholder={recipientPlaceholder}
          />
          <Input
            label={relationshipLabel}
            value={relationship}
            onChangeText={onChangeRelationship}
            placeholder={relationshipPlaceholder}
          />
        </View>
      </View>
      <View style={[styles.separator, { borderColor: lineColor }]} />
      <Input
        label={messageLabel}
        value={message}
        onChangeText={onChangeMessage}
        placeholder={messagePlaceholder}
        multiline
        style={{ minHeight: 120, textAlignVertical: "top" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  toRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  toLabel: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    fontStyle: "italic",
    paddingTop: 28,
  },
  toInputs: {
    flex: 1,
    gap: Spacing.xs,
  },
  separator: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
  },
});
