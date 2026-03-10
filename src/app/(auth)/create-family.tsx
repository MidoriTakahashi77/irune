import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { createFamily } from "@/services/families";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  RELATIONSHIP_CONFIG,
  RELATIONSHIPS,
  getRelationshipDisplayJa,
} from "@/constants/relationships";
import type { Relationship } from "@/types/events";

type Step = "name" | "role";

const BIRTH_ORDERS = [1, 2, 3, 4, 5];

export default function CreateFamilyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [step, setStep] = useState<Step>("name");
  const [familyName, setFamilyName] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("father");
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [birthOrder, setBirthOrder] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showBirthOrder = RELATIONSHIP_CONFIG[relationship].hasBirthOrder;

  async function handleCreateFamily() {
    if (!familyName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const family = await createFamily(familyName.trim());
      setFamilyId(family.id);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ family_id: family.id, role: "admin" })
          .eq("id", user.id);
      }
      setStep("role");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectRole() {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            relationship,
            relationship_label: relationshipLabel.trim() || null,
            birth_order: showBirthOrder ? birthOrder : null,
          })
          .eq("id", user.id);
      }
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>
              {error}
            </Text>
          ) : null}

          {step === "name" && (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("auth.createFamily")}
              </Text>

              <Input
                label={t("auth.familyName")}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="例: 田中家"
              />

              <Button
                title={t("auth.createFamily")}
                onPress={handleCreateFamily}
                loading={loading}
                disabled={!familyName.trim()}
              />

              <TouchableOpacity
                onPress={() => router.push("/(auth)/join-family")}
                style={styles.link}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  {t("auth.joinFamily")}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === "role" && (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("relationship.selectRole")}
              </Text>

              <View style={styles.roleGrid}>
                {RELATIONSHIPS.map((rel) => {
                  const config = RELATIONSHIP_CONFIG[rel];
                  const isSelected = relationship === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.rolePill,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.backgroundElement,
                        },
                      ]}
                      onPress={() => setRelationship(rel)}
                    >
                      <Ionicons
                        name={config.icon as any}
                        size={24}
                        color={isSelected ? "#FFFFFF" : colors.text}
                      />
                      <Text
                        style={[
                          styles.roleText,
                          {
                            color: isSelected ? "#FFFFFF" : colors.text,
                          },
                        ]}
                      >
                        {t(config.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showBirthOrder && (
                <View style={styles.birthOrderSection}>
                  <Text
                    style={[styles.birthOrderLabel, { color: colors.text }]}
                  >
                    {t("relationship.birthOrder")}
                  </Text>
                  <View style={styles.birthOrderRow}>
                    {BIRTH_ORDERS.map((order) => {
                      const isSelected = birthOrder === order;
                      const label = getRelationshipDisplayJa(
                        relationship,
                        order
                      );
                      return (
                        <TouchableOpacity
                          key={order}
                          style={[
                            styles.birthOrderPill,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.backgroundElement,
                            },
                          ]}
                          onPress={() => setBirthOrder(order)}
                        >
                          <Text
                            style={[
                              styles.birthOrderText,
                              {
                                color: isSelected ? "#FFFFFF" : colors.text,
                              },
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {relationship === "other" && (
                <Input
                  label={t("relationship.customLabel")}
                  placeholder={t("relationship.customLabelPlaceholder")}
                  value={relationshipLabel}
                  onChangeText={setRelationshipLabel}
                />
              )}

              <Button
                title={t("common.save")}
                onPress={handleSelectRole}
                loading={loading}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
  },
  link: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  linkText: {
    fontSize: FontSize.md,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    justifyContent: "center",
  },
  rolePill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 100,
    gap: Spacing.xs,
  },
  roleText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  birthOrderSection: {
    marginBottom: Spacing.lg,
  },
  birthOrderLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  birthOrderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  birthOrderPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  birthOrderText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
});
