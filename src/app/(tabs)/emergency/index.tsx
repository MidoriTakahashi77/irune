import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  useEmergencyContacts,
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
} from "@/hooks/useEmergencyContacts";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { EmergencyContactCategory } from "@/types/events";

const CATEGORIES: EmergencyContactCategory[] = [
  "emergency",
  "death_notification",
  "professional",
];

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: contacts = [] } = useEmergencyContacts(profile?.family_id);
  const createContact = useCreateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [category, setCategory] = useState<EmergencyContactCategory>("emergency");
  const [email, setEmail] = useState("");

  async function handleAdd() {
    if (!name.trim() || !phone.trim() || !profile?.family_id) return;

    await createContact.mutateAsync({
      family_id: profile.family_id,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || "other",
      category,
      email: email.trim() || null,
    });

    setName("");
    setPhone("");
    setRelationship("");
    setEmail("");
    setShowForm(false);
  }

  function handleDelete(id: string) {
    Alert.alert(t("emergency.deleteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteContact.mutateAsync(id),
      },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView>
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

          {CATEGORIES.map((cat) => {
            const catContacts = contacts.filter((c) => c.category === cat);
            return (
              <View key={cat} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t(`emergency.category.${cat}`)}
                </Text>
                {catContacts.length === 0 ? (
                  <Text style={[styles.empty, { color: colors.textSecondary }]}>
                    {t("common.empty")}
                  </Text>
                ) : (
                  catContacts.map((contact) => (
                    <Card key={contact.id} style={styles.contactCard}>
                      <View style={styles.contactRow}>
                        <View style={styles.contactInfo}>
                          <Text style={[styles.contactName, { color: colors.text }]}>
                            {contact.name}
                          </Text>
                          <Text style={[styles.contactMeta, { color: colors.textSecondary }]}>
                            {contact.relationship} · {contact.phone}
                          </Text>
                          {contact.email && (
                            <Text style={[styles.contactMeta, { color: colors.textSecondary }]}>
                              {contact.email}
                            </Text>
                          )}
                        </View>
                        <View style={styles.contactActions}>
                          <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                          >
                            <Ionicons name="call" size={22} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(contact.id)}>
                            <Ionicons name="trash-outline" size={22} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            );
          })}

          {showForm ? (
            <Card style={styles.form}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {t("emergency.addContact")}
              </Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t("emergency.categoryLabel")}
              </Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <Text
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor:
                          category === cat ? colors.primary : colors.backgroundElement,
                        color: category === cat ? "#FFFFFF" : colors.text,
                        borderColor: category === cat ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {t(`emergency.category.${cat}`)}
                  </Text>
                ))}
              </View>

              <Input
                label={t("emergency.contactName")}
                value={name}
                onChangeText={setName}
              />
              <Input
                label={t("emergency.contactPhone")}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label={t("emergency.contactRelationship")}
                value={relationship}
                onChangeText={setRelationship}
              />
              <Input
                label={t("emergency.contactEmail")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.formButtons}>
                <Button
                  title={t("common.cancel")}
                  onPress={() => setShowForm(false)}
                  variant="ghost"
                />
                <Button
                  title={t("common.save")}
                  onPress={handleAdd}
                  loading={createContact.isPending}
                />
              </View>
            </Card>
          ) : (
            <Button
              title={t("emergency.addContact")}
              onPress={() => setShowForm(true)}
              variant="secondary"
            />
          )}
        </View>
      </ScrollView>
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
    paddingTop: 0,
    gap: Spacing.lg,
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
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
  },
  empty: {
    fontSize: FontSize.md,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  contactCard: {
    marginBottom: Spacing.xs,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  contactMeta: {
    fontSize: FontSize.sm,
  },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  form: {
    gap: Spacing.sm,
  },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "500",
  },
  categoryRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  categoryOption: {
    fontSize: FontSize.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
});
