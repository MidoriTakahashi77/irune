import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("emergency.title")}
      </Text>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.notSafeButton, { backgroundColor: colors.error }]}
          onPress={() => Linking.openURL("tel:110")}
        >
          <Ionicons name="alert-circle" size={32} color="#FFFFFF" />
          <Text style={styles.notSafeText}>{t("emergency.notSafe")}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("emergency.contacts")}
          </Text>
          <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
            {t("common.empty")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    padding: Spacing.lg,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  notSafeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    minHeight: 80,
  },
  notSafeText: {
    color: "#FFFFFF",
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  placeholder: {
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },
});
