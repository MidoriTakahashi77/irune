import { View, StyleSheet, type ViewStyle } from "react-native";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.backgroundElement },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.md,
  },
});
