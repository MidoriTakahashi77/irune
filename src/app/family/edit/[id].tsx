import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useMemberDetails, useUpsertMemberDetails } from "@/hooks/useMemberDetails";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const GENDER_OPTIONS = ["male", "female", "other"] as const;
const BLOOD_TYPE_OPTIONS = ["A", "B", "O", "AB"] as const;

export default function EditMemberDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: details } = useMemberDetails(id);
  const upsert = useUpsertMemberDetails();

  const [fullName, setFullName] = useState("");
  const [fullNameKana, setFullNameKana] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (details) {
      setFullName(details.full_name ?? "");
      setFullNameKana(details.full_name_kana ?? "");
      setBirthDate(details.birth_date ?? "");
      setGender(details.gender ?? "");
      setBloodType(details.blood_type ?? "");
      setPhone(details.phone ?? "");
      setEmail(details.email ?? "");
      setAddress(details.address ?? "");
      setNotes(details.notes ?? "");
    }
  }, [details]);

  async function handleSave() {
    if (!id) return;

    await upsert.mutateAsync({
      profileId: id,
      details: {
        full_name: fullName || null,
        full_name_kana: fullNameKana || null,
        birth_date: birthDate || null,
        gender: gender || null,
        blood_type: bloodType || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        notes: notes || null,
      },
    });

    router.back();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Button
          title={t("common.cancel")}
          onPress={() => router.back()}
          variant="ghost"
        />
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t("family.editDetails")}
        </Text>
        <Button
          title={t("common.save")}
          onPress={handleSave}
          loading={upsert.isPending}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t("family.fullName")}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("family.fullNamePlaceholder")}
        />
        <Input
          label={t("family.fullNameKana")}
          value={fullNameKana}
          onChangeText={setFullNameKana}
          placeholder={t("family.fullNameKanaPlaceholder")}
        />
        <Input
          label={t("family.birthDate")}
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("family.gender")}
        </Text>
        <View style={styles.optionRow}>
          {GENDER_OPTIONS.map((opt) => (
            <Text
              key={opt}
              onPress={() => setGender(opt)}
              style={[
                styles.option,
                {
                  backgroundColor: gender === opt ? colors.primary : colors.backgroundElement,
                  color: gender === opt ? "#FFFFFF" : colors.text,
                  borderColor: gender === opt ? colors.primary : colors.border,
                },
              ]}
            >
              {t(`lifenote.options.${opt}`, opt)}
            </Text>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t("family.bloodType")}
        </Text>
        <View style={styles.optionRow}>
          {BLOOD_TYPE_OPTIONS.map((opt) => (
            <Text
              key={opt}
              onPress={() => setBloodType(opt)}
              style={[
                styles.option,
                {
                  backgroundColor: bloodType === opt ? colors.primary : colors.backgroundElement,
                  color: bloodType === opt ? "#FFFFFF" : colors.text,
                  borderColor: bloodType === opt ? colors.primary : colors.border,
                },
              ]}
            >
              {opt}
            </Text>
          ))}
        </View>

        <Input
          label={t("family.phone")}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Input
          label={t("family.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label={t("family.address")}
          value={address}
          onChangeText={setAddress}
        />
        <Input
          label={t("family.notes")}
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  topBarTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  optionRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  option: {
    fontSize: FontSize.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
});
