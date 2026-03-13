import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing, FontSize } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { LifeNoteBody } from "@/types/notes";

interface WizardQuestion {
  key: string;
  questionKey: string;
  options: { value: string; labelKey: string }[];
}

interface WizardFormProps {
  type: "life_care" | "life_funeral";
  onComplete: (values: LifeNoteBody) => void;
  onSkip: () => void;
}

const CARE_QUESTIONS: WizardQuestion[] = [
  {
    key: "care_location_pref",
    questionKey: "lifenote.wizard.care.q1",
    options: [
      { value: "home", labelKey: "lifenote.wizard.care.home" },
      { value: "facility", labelKey: "lifenote.wizard.care.facility" },
      { value: "undecided", labelKey: "lifenote.wizard.care.undecided" },
    ],
  },
  {
    key: "care_priority",
    questionKey: "lifenote.wizard.care.q2",
    options: [
      { value: "independence", labelKey: "lifenote.wizard.care.independence" },
      { value: "safety", labelKey: "lifenote.wizard.care.safety" },
      { value: "family_burden", labelKey: "lifenote.wizard.care.familyBurden" },
    ],
  },
  {
    key: "care_certified",
    questionKey: "lifenote.wizard.care.q3",
    options: [
      { value: "yes", labelKey: "lifenote.wizard.care.certified" },
      { value: "no", labelKey: "lifenote.wizard.care.notCertified" },
      { value: "unknown", labelKey: "lifenote.wizard.care.dontKnow" },
    ],
  },
];

const FUNERAL_QUESTIONS: WizardQuestion[] = [
  {
    key: "funeral_style",
    questionKey: "lifenote.wizard.funeral.q1",
    options: [
      { value: "religious", labelKey: "lifenote.wizard.funeral.religious" },
      { value: "secular", labelKey: "lifenote.wizard.funeral.secular" },
      { value: "family_only", labelKey: "lifenote.wizard.funeral.familyOnly" },
      { value: "no_funeral", labelKey: "lifenote.wizard.funeral.noFuneral" },
    ],
  },
  {
    key: "burial_type",
    questionKey: "lifenote.wizard.funeral.q2",
    options: [
      { value: "grave", labelKey: "lifenote.wizard.funeral.grave" },
      { value: "tree_burial", labelKey: "lifenote.wizard.funeral.treeBurial" },
      { value: "sea_scattering", labelKey: "lifenote.wizard.funeral.seaScattering" },
      { value: "undecided", labelKey: "lifenote.wizard.funeral.undecided" },
    ],
  },
  {
    key: "budget_range",
    questionKey: "lifenote.wizard.funeral.q3",
    options: [
      { value: "minimal", labelKey: "lifenote.wizard.funeral.minimal" },
      { value: "standard", labelKey: "lifenote.wizard.funeral.standard" },
      { value: "generous", labelKey: "lifenote.wizard.funeral.generous" },
      { value: "undecided", labelKey: "lifenote.wizard.funeral.undecidedBudget" },
    ],
  },
];

export function WizardForm({ type, onComplete, onSkip }: WizardFormProps) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const questions = type === "life_care" ? CARE_QUESTIONS : FUNERAL_QUESTIONS;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<LifeNoteBody>({});

  const currentQuestion = questions[step];
  const isLast = step === questions.length - 1;

  function selectOption(value: string) {
    const updated = { ...answers, [currentQuestion.key]: value };
    setAnswers(updated);

    if (isLast) {
      onComplete(updated);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i <= step ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
        {t("lifenote.wizard.stepOf", { current: step + 1, total: questions.length })}
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        {t(currentQuestion.questionKey)}
      </Text>

      <View style={styles.options}>
        {currentQuestion.options.map((opt) => {
          const selected = answers[currentQuestion.key] === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: selected ? colors.primaryLight : colors.backgroundElement,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => selectOption(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: selected ? colors.primary : colors.text },
                ]}
              >
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(step - 1)}>
            <Text style={[styles.backText, { color: colors.textSecondary }]}>
              {t("common.back", "戻る")}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {t("lifenote.wizard.skip", "スキップして自由入力")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLabel: {
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  question: {
    fontSize: FontSize.xl,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 32,
  },
  options: {
    gap: Spacing.sm,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  backText: {
    fontSize: FontSize.sm,
  },
  skipButton: {
    marginLeft: "auto",
  },
  skipText: {
    fontSize: FontSize.sm,
  },
});
