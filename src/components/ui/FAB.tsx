import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function FAB({ onPress, icon = "add" }: FABProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.primary }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="fab"
      testID="fab"
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
