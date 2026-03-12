import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useMemberDetails } from "@/hooks/useMemberDetails";
import { useFamily } from "@/hooks/useFamily";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function MemberDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: members = [] } = useFamily(profile?.family_id);
  const member = members.find((m: { id: string }) => m.id === id);
  const { data: details, isLoading } = useMemberDetails(id);

  if (!member) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canEdit =
    member.id === profile?.id || member.managed_by === profile?.id;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.back")}
          onPress={() => router.back()}
          variant="ghost"
        />
        {canEdit && (
          <Button
            title={t("common.edit")}
            onPress={() => router.push(`/family/edit/${id}`)}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: member.color }]}>
            <Text style={styles.avatarText}>
              {member.display_name.charAt(0)}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {member.display_name}
            </Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>
              {t(`relationship.${member.relationship}`)}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <Text style={{ color: colors.textSecondary }}>{t("common.loading")}</Text>
        ) : details ? (
          <Card>
            <View style={styles.fields}>
              {details.full_name && (
                <Field label={t("family.fullName")} value={details.full_name} colors={colors} />
              )}
              {details.full_name_kana && (
                <Field label={t("family.fullNameKana")} value={details.full_name_kana} colors={colors} />
              )}
              {details.birth_date && (
                <Field label={t("family.birthDate")} value={details.birth_date} colors={colors} />
              )}
              {details.gender && (
                <Field label={t("family.gender")} value={String(t(`lifenote.options.${details.gender}`, details.gender))} colors={colors} />
              )}
              {details.blood_type && (
                <Field label={t("family.bloodType")} value={details.blood_type} colors={colors} />
              )}
              {details.phone && (
                <Field label={t("family.phone")} value={details.phone} colors={colors} />
              )}
              {details.email && (
                <Field label={t("family.email")} value={details.email} colors={colors} />
              )}
              {details.address && (
                <Field label={t("family.address")} value={details.address} colors={colors} />
              )}
              {details.notes && (
                <Field label={t("family.notes")} value={details.notes} colors={colors} />
              )}
            </View>
          </Card>
        ) : (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            {t("family.noDetails")}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <View style={fieldStyles.row}>
      <Text style={[fieldStyles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[fieldStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  row: {
    gap: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  value: {
    fontSize: FontSize.md,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.xxl,
    fontWeight: "bold",
  },
  headerInfo: {
    gap: Spacing.xs,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  role: {
    fontSize: FontSize.md,
  },
  fields: {
    gap: Spacing.md,
  },
  empty: {
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },
});
