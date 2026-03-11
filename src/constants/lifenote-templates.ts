import type { LifeNoteTemplate } from "@/types/notes";

export const LIFE_NOTE_TEMPLATES: LifeNoteTemplate[] = [
  {
    type: "life_profile",
    titleKey: "lifenote.categories.life_profile",
    icon: "person-circle-outline",
    sections: [
      {
        titleKey: "lifenote.sections.basicInfo",
        fields: [
          { key: "full_name", labelKey: "lifenote.fields.fullName", type: "text" },
          { key: "full_name_kana", labelKey: "lifenote.fields.fullNameKana", type: "text" },
          { key: "birth_date", labelKey: "lifenote.fields.birthDate", type: "date" },
          { key: "gender", labelKey: "lifenote.fields.gender", type: "select", options: ["male", "female", "other"] },
          { key: "blood_type", labelKey: "lifenote.fields.bloodType", type: "select", options: ["A", "B", "O", "AB"] },
          { key: "address", labelKey: "lifenote.fields.address", type: "text" },
          { key: "phone", labelKey: "lifenote.fields.phone", type: "text" },
        ],
      },
    ],
  },
  {
    type: "life_medical",
    titleKey: "lifenote.categories.life_medical",
    icon: "medkit-outline",
    sections: [
      {
        titleKey: "lifenote.sections.medicalInfo",
        fields: [
          { key: "hospital", labelKey: "lifenote.fields.hospital", type: "text" },
          { key: "doctor", labelKey: "lifenote.fields.doctor", type: "text" },
          { key: "conditions", labelKey: "lifenote.fields.conditions", type: "textarea" },
          { key: "medications", labelKey: "lifenote.fields.medications", type: "textarea" },
          { key: "allergies", labelKey: "lifenote.fields.allergies", type: "textarea" },
          { key: "insurance_number", labelKey: "lifenote.fields.insuranceNumber", type: "text" },
          { key: "donor_card", labelKey: "lifenote.fields.donorCard", type: "boolean" },
          { key: "life_support_wishes", labelKey: "lifenote.fields.lifeSupportWishes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_care",
    titleKey: "lifenote.categories.life_care",
    icon: "accessibility-outline",
    sections: [
      {
        titleKey: "lifenote.sections.careInfo",
        fields: [
          { key: "care_wishes", labelKey: "lifenote.fields.careWishes", type: "textarea" },
          { key: "preferred_facility", labelKey: "lifenote.fields.preferredFacility", type: "text" },
          { key: "care_manager", labelKey: "lifenote.fields.careManager", type: "text" },
          { key: "care_level", labelKey: "lifenote.fields.careLevel", type: "text" },
          { key: "daily_routine", labelKey: "lifenote.fields.dailyRoutine", type: "textarea" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_funeral",
    titleKey: "lifenote.categories.life_funeral",
    icon: "flower-outline",
    sections: [
      {
        titleKey: "lifenote.sections.funeralInfo",
        fields: [
          { key: "funeral_style", labelKey: "lifenote.fields.funeralStyle", type: "select", options: ["religious", "secular", "family_only", "no_funeral"] },
          { key: "religion", labelKey: "lifenote.fields.religion", type: "text" },
          { key: "preferred_company", labelKey: "lifenote.fields.preferredCompany", type: "text" },
          { key: "budget", labelKey: "lifenote.fields.budget", type: "text" },
          { key: "music", labelKey: "lifenote.fields.music", type: "textarea" },
          { key: "flowers", labelKey: "lifenote.fields.flowers", type: "text" },
          { key: "photo", labelKey: "lifenote.fields.photo", type: "text" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_burial",
    titleKey: "lifenote.categories.life_burial",
    icon: "leaf-outline",
    sections: [
      {
        titleKey: "lifenote.sections.burialInfo",
        fields: [
          { key: "burial_type", labelKey: "lifenote.fields.burialType", type: "select", options: ["grave", "tree_burial", "sea_scattering", "ossuary", "other"] },
          { key: "cemetery", labelKey: "lifenote.fields.cemetery", type: "text" },
          { key: "grave_location", labelKey: "lifenote.fields.graveLocation", type: "text" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_assets",
    titleKey: "lifenote.categories.life_assets",
    icon: "wallet-outline",
    sections: [
      {
        titleKey: "lifenote.sections.assetsInfo",
        fields: [
          { key: "bank_accounts", labelKey: "lifenote.fields.bankAccounts", type: "textarea" },
          { key: "securities", labelKey: "lifenote.fields.securities", type: "textarea" },
          { key: "real_estate", labelKey: "lifenote.fields.realEstate", type: "textarea" },
          { key: "insurance", labelKey: "lifenote.fields.insurance", type: "textarea" },
          { key: "debts", labelKey: "lifenote.fields.debts", type: "textarea" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_contracts",
    titleKey: "lifenote.categories.life_contracts",
    icon: "document-text-outline",
    sections: [
      {
        titleKey: "lifenote.sections.contractsInfo",
        fields: [
          { key: "utilities", labelKey: "lifenote.fields.utilities", type: "textarea" },
          { key: "subscriptions", labelKey: "lifenote.fields.subscriptions", type: "textarea" },
          { key: "credit_cards", labelKey: "lifenote.fields.creditCards", type: "textarea" },
          { key: "memberships", labelKey: "lifenote.fields.memberships", type: "textarea" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_digital",
    titleKey: "lifenote.categories.life_digital",
    icon: "phone-portrait-outline",
    sections: [
      {
        titleKey: "lifenote.sections.digitalInfo",
        fields: [
          { key: "email_accounts", labelKey: "lifenote.fields.emailAccounts", type: "textarea" },
          { key: "social_media", labelKey: "lifenote.fields.socialMedia", type: "textarea" },
          { key: "cloud_storage", labelKey: "lifenote.fields.cloudStorage", type: "textarea" },
          { key: "device_passwords", labelKey: "lifenote.fields.devicePasswords", type: "textarea" },
          { key: "digital_assets", labelKey: "lifenote.fields.digitalAssets", type: "textarea" },
          { key: "deletion_wishes", labelKey: "lifenote.fields.deletionWishes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_pension",
    titleKey: "lifenote.categories.life_pension",
    icon: "shield-checkmark-outline",
    sections: [
      {
        titleKey: "lifenote.sections.pensionInfo",
        fields: [
          { key: "pension_number", labelKey: "lifenote.fields.pensionNumber", type: "text" },
          { key: "pension_type", labelKey: "lifenote.fields.pensionType", type: "text" },
          { key: "health_insurance", labelKey: "lifenote.fields.healthInsurance", type: "text" },
          { key: "my_number", labelKey: "lifenote.fields.myNumber", type: "text" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_pet",
    titleKey: "lifenote.categories.life_pet",
    icon: "paw-outline",
    sections: [
      {
        titleKey: "lifenote.sections.petInfo",
        fields: [
          { key: "pet_name", labelKey: "lifenote.fields.petName", type: "text" },
          { key: "species", labelKey: "lifenote.fields.species", type: "text" },
          { key: "birth_date", labelKey: "lifenote.fields.birthDate", type: "date" },
          { key: "veterinarian", labelKey: "lifenote.fields.veterinarian", type: "text" },
          { key: "food", labelKey: "lifenote.fields.food", type: "textarea" },
          { key: "caretaker", labelKey: "lifenote.fields.caretaker", type: "text" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_will",
    titleKey: "lifenote.categories.life_will",
    icon: "document-lock-outline",
    sections: [
      {
        titleKey: "lifenote.sections.willInfo",
        fields: [
          { key: "has_will", labelKey: "lifenote.fields.hasWill", type: "boolean" },
          { key: "will_location", labelKey: "lifenote.fields.willLocation", type: "text" },
          { key: "executor", labelKey: "lifenote.fields.executor", type: "text" },
          { key: "lawyer", labelKey: "lifenote.fields.lawyer", type: "text" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_keepsake",
    titleKey: "lifenote.categories.life_keepsake",
    icon: "key-outline",
    sections: [
      {
        titleKey: "lifenote.sections.keepsakeInfo",
        fields: [
          { key: "items", labelKey: "lifenote.fields.items", type: "textarea" },
          { key: "recipients", labelKey: "lifenote.fields.recipients", type: "textarea" },
          { key: "disposal_wishes", labelKey: "lifenote.fields.disposalWishes", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_message",
    titleKey: "lifenote.categories.life_message",
    icon: "mail-outline",
    sections: [
      {
        titleKey: "lifenote.sections.messageInfo",
        fields: [
          { key: "to_family", labelKey: "lifenote.fields.toFamily", type: "textarea" },
          { key: "to_friends", labelKey: "lifenote.fields.toFriends", type: "textarea" },
          { key: "gratitude", labelKey: "lifenote.fields.gratitude", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "life_history",
    titleKey: "lifenote.categories.life_history",
    icon: "book-outline",
    sections: [
      {
        titleKey: "lifenote.sections.historyInfo",
        fields: [
          { key: "childhood", labelKey: "lifenote.fields.childhood", type: "textarea" },
          { key: "school", labelKey: "lifenote.fields.school", type: "textarea" },
          { key: "career", labelKey: "lifenote.fields.career", type: "textarea" },
          { key: "marriage", labelKey: "lifenote.fields.marriage", type: "textarea" },
          { key: "memorable_events", labelKey: "lifenote.fields.memorableEvents", type: "textarea" },
          { key: "lessons", labelKey: "lifenote.fields.lessons", type: "textarea" },
        ],
      },
    ],
  },
];

export function getTemplateByType(type: string): LifeNoteTemplate | undefined {
  return LIFE_NOTE_TEMPLATES.find((t) => t.type === type);
}

export function isLifeNoteType(type: string): boolean {
  return type.startsWith("life_");
}
