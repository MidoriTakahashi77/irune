import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import {
  useTrustedContacts,
  useCreateTrustedContact,
  useUpdateTrustedContact,
  useDeleteTrustedContact,
  useSendSos,
} from "@/hooks/useTrustedContacts";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { TrustedContactType, ProfileWithDetails } from "@/types/events";

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const { data: members = [] } = useFamily(profile?.family_id);
  const { data: contacts = [] } = useTrustedContacts(profile?.family_id);
  const createContact = useCreateTrustedContact();
  const updateContact = useUpdateTrustedContact();
  const deleteContact = useDeleteTrustedContact();
  const sendSos = useSendSos();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [contactType, setContactType] = useState<TrustedContactType>("friend");

  const familyContactMap = new Map(
    contacts
      .filter((c) => c.profile_id)
      .map((c) => [c.profile_id!, c])
  );

  const externalContacts = contacts.filter((c) => !c.profile_id);

  const sosTargets = contacts.filter((c) => c.is_sos_target);
  const hasSosEmailTargets = sosTargets.some((c) => c.email);

  async function handleToggleFamilyMember(member: ProfileWithDetails) {
    if (!profile?.family_id) return;

    const existing = familyContactMap.get(member.id);
    if (existing) {
      await updateContact.mutateAsync({
        id: existing.id,
        updates: { is_sos_target: !existing.is_sos_target },
      });
    } else {
      const details = member.member_details[0];
      await createContact.mutateAsync({
        family_id: profile.family_id,
        profile_id: member.id,
        name: member.display_name,
        email: details?.email ?? null,
        phone: details?.phone ?? null,
        relationship: member.relationship ?? "other",
        type: "family" as TrustedContactType,
        is_sos_target: true,
        created_by: profile.id,
      });
    }
  }

  async function handleAddExternal() {
    if (!name.trim() || !profile?.family_id) return;

    await createContact.mutateAsync({
      family_id: profile.family_id,
      profile_id: null,
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      relationship: relationship.trim() || "other",
      type: contactType,
      is_sos_target: true,
      created_by: profile.id,
    });

    setName("");
    setPhone("");
    setRelationship("");
    setEmail("");
    setShowForm(false);
  }

  function handleDeleteExternal(id: string) {
    Alert.alert(t("emergency.deleteConfirm"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteContact.mutateAsync(id),
      },
    ]);
  }

  function handleSos() {
    if (!profile?.family_id) return;

    Alert.alert(
      t("emergency.sosConfirmTitle"),
      t("emergency.sosConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("emergency.sosSend"),
          style: "destructive",
          onPress: async () => {
            try {
              const result = await sendSos.mutateAsync({
                familyId: profile.family_id!,
                senderName: profile.display_name ?? t("emergency.unknownSender"),
              });
              Alert.alert(
                t("emergency.sosSentTitle"),
                t("emergency.sosSentMessage", { count: result.sent })
              );
            } catch {
              Alert.alert(t("common.error"), t("emergency.sosFailed"));
            }
          },
        },
      ]
    );
  }

  function handleCall(number: string, titleKey: string, messageKey: string) {
    Alert.alert(t(titleKey), t(messageKey), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("emergency.callNow"),
        style: "destructive",
        onPress: () => Linking.openURL(`tel:${number}`),
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("emergency.title")}
        </Text>

        <View style={styles.content}>
          {/* SOSボタン */}
          <TouchableOpacity
            style={[
              styles.sosButton,
              { backgroundColor: colors.error },
              (!hasSosEmailTargets || sendSos.isPending) && styles.sosDisabled,
            ]}
            onPress={handleSos}
            disabled={sendSos.isPending || !hasSosEmailTargets}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={36} color="#FFFFFF" />
            <Text style={styles.sosButtonText}>
              {sendSos.isPending ? t("emergency.sosSending") : t("emergency.sosButton")}
            </Text>
            <Text style={styles.sosSubText}>{t("emergency.sosDescription")}</Text>
          </TouchableOpacity>

          {sosTargets.length > 0 && !hasSosEmailTargets && (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t("emergency.noSosEmailHint")}
            </Text>
          )}

          {/* 緊急通報 */}
          <View style={styles.callRow}>
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: "#FF6B35" }]}
              onPress={() => handleCall("119", "emergency.call119Title", "emergency.call119Message")}
              activeOpacity={0.7}
            >
              <Ionicons name="medkit" size={24} color="#FFFFFF" />
              <Text style={styles.callButtonText}>{t("emergency.call119")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: "#1A73E8" }]}
              onPress={() => handleCall("110", "emergency.call110Title", "emergency.call110Message")}
              activeOpacity={0.7}
            >
              <Ionicons name="shield" size={24} color="#FFFFFF" />
              <Text style={styles.callButtonText}>{t("emergency.call110")}</Text>
            </TouchableOpacity>
          </View>

          {/* 家族メンバー */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("emergency.familyMembers")}
            </Text>
            {members
              .filter((m) => m.id !== profile?.id)
              .map((member) => {
                const tc = familyContactMap.get(member.id);
                const isSos = tc?.is_sos_target ?? false;
                const details = member.member_details[0];
                return (
                  <Card key={member.id} style={styles.memberCard}>
                    <View style={styles.memberRow}>
                      <View
                        style={[styles.avatar, { backgroundColor: member.color ?? colors.primary }]}
                      >
                        <Text style={styles.avatarText}>
                          {member.display_name[0] ?? "?"}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: colors.text }]}>
                          {member.display_name}
                        </Text>
                        <Text style={[styles.memberMeta, { color: colors.textSecondary }]}>
                          {details?.phone ?? t("emergency.noPhone")}
                          {details?.email ? ` · ${details.email}` : ""}
                        </Text>
                      </View>
                      <View style={styles.sosToggle}>
                        <Text style={[styles.sosLabel, { color: colors.textSecondary }]}>
                          {t("emergency.sosTarget")}
                        </Text>
                        <Switch
                          value={isSos}
                          onValueChange={() => handleToggleFamilyMember(member)}
                          trackColor={{ true: colors.error }}
                        />
                      </View>
                    </View>
                  </Card>
                );
              })}
          </View>

          {/* 外部連絡先 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("emergency.otherContacts")}
            </Text>
            {externalContacts.length === 0 && !showForm && (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>
                {t("common.empty")}
              </Text>
            )}
            {externalContacts.map((contact) => (
              <Card key={contact.id} style={styles.memberCard}>
                <View style={styles.memberRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.textSecondary }]}>
                    <Ionicons
                      name={contact.type === "professional" ? "briefcase" : "person"}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {contact.name}
                      <Text style={[styles.memberMeta, { color: colors.textSecondary }]}>
                        {" "}({contact.relationship})
                      </Text>
                    </Text>
                    <Text style={[styles.memberMeta, { color: colors.textSecondary }]}>
                      {contact.phone ?? t("emergency.noPhone")}
                      {contact.email ? ` · ${contact.email}` : ""}
                    </Text>
                  </View>
                  <View style={styles.externalActions}>
                    <View style={styles.sosToggle}>
                      <Switch
                        value={contact.is_sos_target}
                        onValueChange={() =>
                          updateContact.mutateAsync({
                            id: contact.id,
                            updates: { is_sos_target: !contact.is_sos_target },
                          })
                        }
                        trackColor={{ true: colors.error }}
                      />
                    </View>
                    {contact.phone && (
                      <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phone}`)}>
                        <Ionicons name="call" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDeleteExternal(contact.id)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            {showForm ? (
              <Card style={styles.form}>
                <View style={styles.typeRow}>
                  {(["friend", "professional"] as TrustedContactType[]).map((ct) => (
                    <Text
                      key={ct}
                      onPress={() => setContactType(ct)}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: contactType === ct ? colors.primary : colors.backgroundElement,
                          color: contactType === ct ? "#FFFFFF" : colors.text,
                          borderColor: contactType === ct ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {t(`emergency.type${ct === "friend" ? "Friend" : "Professional"}`)}
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
                  label={t("emergency.contactEmail")}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label={t("emergency.contactRelationship")}
                  value={relationship}
                  onChangeText={setRelationship}
                />

                <View style={styles.formButtons}>
                  <Button
                    title={t("common.cancel")}
                    onPress={() => setShowForm(false)}
                    variant="ghost"
                  />
                  <Button
                    title={t("common.save")}
                    onPress={handleAddExternal}
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
  sosButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: 16,
    minHeight: 120,
  },
  sosDisabled: {
    opacity: 0.5,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.xl,
    fontWeight: "bold",
  },
  sosSubText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.sm,
  },
  hint: {
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: -Spacing.sm,
  },
  callRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    minHeight: 56,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
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
  memberCard: {
    marginBottom: Spacing.xs,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "bold",
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  memberMeta: {
    fontSize: FontSize.sm,
  },
  sosToggle: {
    alignItems: "center",
    gap: 2,
  },
  sosLabel: {
    fontSize: 11,
  },
  externalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  form: {
    gap: Spacing.sm,
  },
  typeRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  typeOption: {
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
