import type { LifeNoteTemplate } from "@/types/notes";

export const LIFE_NOTE_TEMPLATES: LifeNoteTemplate[] = [
  {
    type: "life_profile",
    titleKey: "lifenote.categories.life_profile",
    icon: "person-circle-outline",
    sections: [
      {
        titleKey: "lifenote.sections.basicInfo",
        descriptionKey: "lifenote.descriptions.basicInfo",
        fields: [
          { key: "full_name", labelKey: "lifenote.fields.fullName", type: "text", placeholderKey: "lifenote.placeholders.fullName" },
          { key: "full_name_kana", labelKey: "lifenote.fields.fullNameKana", type: "text", placeholderKey: "lifenote.placeholders.fullNameKana" },
          { key: "birth_date", labelKey: "lifenote.fields.birthDate", type: "date", placeholderKey: "lifenote.placeholders.birthDate" },
          { key: "gender", labelKey: "lifenote.fields.gender", type: "select", options: ["male", "female", "other"] },
          { key: "blood_type", labelKey: "lifenote.fields.bloodType", type: "select", options: ["A", "B", "O", "AB"] },
          { key: "address", labelKey: "lifenote.fields.address", type: "text", placeholderKey: "lifenote.placeholders.address" },
          { key: "phone", labelKey: "lifenote.fields.phone", type: "text", placeholderKey: "lifenote.placeholders.phone" },
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
        descriptionKey: "lifenote.descriptions.medicalInfo",
        fields: [
          { key: "hospitals", labelKey: "lifenote.fields.hospital", type: "repeatable", fields: [
            { key: "name", labelKey: "lifenote.fields.hospitalName", type: "text", placeholderKey: "lifenote.placeholders.hospitalName" },
            { key: "department", labelKey: "lifenote.fields.department", type: "text", placeholderKey: "lifenote.placeholders.department" },
            { key: "doctor", labelKey: "lifenote.fields.doctor", type: "text", placeholderKey: "lifenote.placeholders.doctor" },
            { key: "phone", labelKey: "lifenote.fields.phone", type: "text", placeholderKey: "lifenote.placeholders.hospitalPhone" },
          ]},
          { key: "conditions", labelKey: "lifenote.fields.conditions", type: "textarea", placeholderKey: "lifenote.placeholders.conditions" },
          { key: "medications", labelKey: "lifenote.fields.medications", type: "repeatable", fields: [
            { key: "name", labelKey: "lifenote.fields.medicationName", type: "text", placeholderKey: "lifenote.placeholders.medicationName" },
            { key: "dosage", labelKey: "lifenote.fields.dosage", type: "text", placeholderKey: "lifenote.placeholders.dosage" },
            { key: "purpose", labelKey: "lifenote.fields.purpose", type: "text", placeholderKey: "lifenote.placeholders.purpose" },
          ]},
          { key: "allergies", labelKey: "lifenote.fields.allergies", type: "textarea", placeholderKey: "lifenote.placeholders.allergies" },
          { key: "insurance_number", labelKey: "lifenote.fields.insuranceNumber", type: "text", placeholderKey: "lifenote.placeholders.insuranceNumber" },
          { key: "donor_card", labelKey: "lifenote.fields.donorCard", type: "boolean" },
          { key: "life_support_wishes", labelKey: "lifenote.fields.lifeSupportWishes", type: "textarea", placeholderKey: "lifenote.placeholders.lifeSupportWishes" },
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
        descriptionKey: "lifenote.descriptions.careInfo",
        fields: [
          { key: "care_wishes", labelKey: "lifenote.fields.careWishes", type: "textarea", placeholderKey: "lifenote.placeholders.careWishes" },
          { key: "preferred_facility", labelKey: "lifenote.fields.preferredFacility", type: "text", placeholderKey: "lifenote.placeholders.preferredFacility" },
          { key: "care_manager", labelKey: "lifenote.fields.careManager", type: "text", placeholderKey: "lifenote.placeholders.careManager" },
          { key: "care_level", labelKey: "lifenote.fields.careLevel", type: "text", placeholderKey: "lifenote.placeholders.careLevel" },
          { key: "daily_routine", labelKey: "lifenote.fields.dailyRoutine", type: "textarea", placeholderKey: "lifenote.placeholders.dailyRoutine" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.careNotes" },
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
        descriptionKey: "lifenote.descriptions.funeralInfo",
        fields: [
          { key: "funeral_style", labelKey: "lifenote.fields.funeralStyle", type: "select", options: ["religious", "secular", "family_only", "no_funeral"] },
          { key: "religion", labelKey: "lifenote.fields.religion", type: "text", placeholderKey: "lifenote.placeholders.religion" },
          { key: "preferred_company", labelKey: "lifenote.fields.preferredCompany", type: "text", placeholderKey: "lifenote.placeholders.preferredCompany" },
          { key: "budget", labelKey: "lifenote.fields.budget", type: "text", placeholderKey: "lifenote.placeholders.budget" },
          { key: "music", labelKey: "lifenote.fields.music", type: "textarea", placeholderKey: "lifenote.placeholders.music" },
          { key: "flowers", labelKey: "lifenote.fields.flowers", type: "text", placeholderKey: "lifenote.placeholders.flowers" },
          { key: "photo", labelKey: "lifenote.fields.photo", type: "text", placeholderKey: "lifenote.placeholders.photo" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.funeralNotes" },
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
        descriptionKey: "lifenote.descriptions.burialInfo",
        fields: [
          { key: "burial_type", labelKey: "lifenote.fields.burialType", type: "select", options: ["grave", "tree_burial", "sea_scattering", "ossuary", "other"] },
          { key: "cemetery", labelKey: "lifenote.fields.cemetery", type: "text", placeholderKey: "lifenote.placeholders.cemetery" },
          { key: "grave_location", labelKey: "lifenote.fields.graveLocation", type: "text", placeholderKey: "lifenote.placeholders.graveLocation" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.burialNotes" },
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
        descriptionKey: "lifenote.descriptions.assetsInfo",
        fields: [
          { key: "bank_accounts", labelKey: "lifenote.fields.bankAccounts", type: "repeatable", fields: [
            { key: "bank", labelKey: "lifenote.fields.bankName", type: "text", placeholderKey: "lifenote.placeholders.bankName" },
            { key: "branch", labelKey: "lifenote.fields.branch", type: "text", placeholderKey: "lifenote.placeholders.branch" },
            { key: "account_type", labelKey: "lifenote.fields.accountType", type: "text", placeholderKey: "lifenote.placeholders.accountType" },
            { key: "number", labelKey: "lifenote.fields.accountNumber", type: "text", placeholderKey: "lifenote.placeholders.accountNumber" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text", placeholderKey: "lifenote.placeholders.accountNotes" },
          ]},
          { key: "securities", labelKey: "lifenote.fields.securities", type: "repeatable", fields: [
            { key: "company", labelKey: "lifenote.fields.securitiesCompany", type: "text", placeholderKey: "lifenote.placeholders.securitiesCompany" },
            { key: "account", labelKey: "lifenote.fields.accountNumber", type: "text", placeholderKey: "lifenote.placeholders.securitiesAccount" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text" },
          ]},
          { key: "real_estate", labelKey: "lifenote.fields.realEstate", type: "textarea", placeholderKey: "lifenote.placeholders.realEstate" },
          { key: "insurance_policies", labelKey: "lifenote.fields.insurance", type: "repeatable", fields: [
            { key: "company", labelKey: "lifenote.fields.insuranceCompany", type: "text", placeholderKey: "lifenote.placeholders.insuranceCompany" },
            { key: "type", labelKey: "lifenote.fields.insuranceType", type: "text", placeholderKey: "lifenote.placeholders.insuranceType" },
            { key: "policy_number", labelKey: "lifenote.fields.policyNumber", type: "text", placeholderKey: "lifenote.placeholders.policyNumber" },
            { key: "contact", labelKey: "lifenote.fields.contactPhone", type: "text", placeholderKey: "lifenote.placeholders.insuranceContact" },
          ]},
          { key: "debts", labelKey: "lifenote.fields.debts", type: "repeatable", fields: [
            { key: "lender", labelKey: "lifenote.fields.lender", type: "text", placeholderKey: "lifenote.placeholders.lender" },
            { key: "amount", labelKey: "lifenote.fields.amount", type: "text", placeholderKey: "lifenote.placeholders.amount" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text" },
          ]},
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.assetsNotes" },
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
        descriptionKey: "lifenote.descriptions.contractsInfo",
        fields: [
          { key: "subscriptions", labelKey: "lifenote.fields.subscriptions", type: "repeatable", fields: [
            { key: "service", labelKey: "lifenote.fields.serviceName", type: "text", placeholderKey: "lifenote.placeholders.serviceName" },
            { key: "account", labelKey: "lifenote.fields.accountId", type: "text", placeholderKey: "lifenote.placeholders.accountId" },
            { key: "fee", labelKey: "lifenote.fields.monthlyFee", type: "text", placeholderKey: "lifenote.placeholders.monthlyFee" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text", placeholderKey: "lifenote.placeholders.contractNotes" },
          ]},
          { key: "credit_cards", labelKey: "lifenote.fields.creditCards", type: "repeatable", fields: [
            { key: "issuer", labelKey: "lifenote.fields.cardIssuer", type: "text", placeholderKey: "lifenote.placeholders.cardIssuer" },
            { key: "last_digits", labelKey: "lifenote.fields.lastDigits", type: "text", placeholderKey: "lifenote.placeholders.lastDigits" },
            { key: "contact", labelKey: "lifenote.fields.contactPhone", type: "text", placeholderKey: "lifenote.placeholders.cardContact" },
          ]},
          { key: "utilities", labelKey: "lifenote.fields.utilities", type: "repeatable", fields: [
            { key: "service", labelKey: "lifenote.fields.serviceName", type: "text", placeholderKey: "lifenote.placeholders.utilityName" },
            { key: "customer_number", labelKey: "lifenote.fields.customerNumber", type: "text", placeholderKey: "lifenote.placeholders.customerNumber" },
            { key: "payment", labelKey: "lifenote.fields.paymentMethod", type: "text", placeholderKey: "lifenote.placeholders.paymentMethod" },
          ]},
          { key: "memberships", labelKey: "lifenote.fields.memberships", type: "repeatable", fields: [
            { key: "name", labelKey: "lifenote.fields.serviceName", type: "text", placeholderKey: "lifenote.placeholders.membershipName" },
            { key: "member_id", labelKey: "lifenote.fields.memberId", type: "text", placeholderKey: "lifenote.placeholders.memberId" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text" },
          ]},
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.contractsOverallNotes" },
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
        descriptionKey: "lifenote.descriptions.digitalInfo",
        fields: [
          { key: "email_accounts", labelKey: "lifenote.fields.emailAccounts", type: "repeatable", fields: [
            { key: "service", labelKey: "lifenote.fields.serviceName", type: "text", placeholderKey: "lifenote.placeholders.emailService" },
            { key: "address", labelKey: "lifenote.fields.emailAddress", type: "text", placeholderKey: "lifenote.placeholders.emailAddress" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text" },
          ]},
          { key: "social_media", labelKey: "lifenote.fields.socialMedia", type: "repeatable", fields: [
            { key: "service", labelKey: "lifenote.fields.serviceName", type: "text", placeholderKey: "lifenote.placeholders.snsService" },
            { key: "username", labelKey: "lifenote.fields.username", type: "text", placeholderKey: "lifenote.placeholders.username" },
            { key: "action", labelKey: "lifenote.fields.afterDeathAction", type: "select", options: ["delete", "memorialize", "leave"] },
          ]},
          { key: "cloud_storage", labelKey: "lifenote.fields.cloudStorage", type: "repeatable", fields: [
            { key: "service", labelKey: "lifenote.fields.serviceName", type: "text", placeholderKey: "lifenote.placeholders.cloudService" },
            { key: "account", labelKey: "lifenote.fields.accountId", type: "text" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text" },
          ]},
          { key: "device_passwords", labelKey: "lifenote.fields.devicePasswords", type: "textarea", placeholderKey: "lifenote.placeholders.devicePasswords" },
          { key: "deletion_wishes", labelKey: "lifenote.fields.deletionWishes", type: "textarea", placeholderKey: "lifenote.placeholders.deletionWishes" },
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
        descriptionKey: "lifenote.descriptions.pensionInfo",
        fields: [
          { key: "pension_number", labelKey: "lifenote.fields.pensionNumber", type: "text", placeholderKey: "lifenote.placeholders.pensionNumber" },
          { key: "pension_type", labelKey: "lifenote.fields.pensionType", type: "text", placeholderKey: "lifenote.placeholders.pensionType" },
          { key: "health_insurance", labelKey: "lifenote.fields.healthInsurance", type: "text", placeholderKey: "lifenote.placeholders.healthInsurance" },
          { key: "my_number", labelKey: "lifenote.fields.myNumber", type: "text", placeholderKey: "lifenote.placeholders.myNumber" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.pensionNotes" },
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
        descriptionKey: "lifenote.descriptions.petInfo",
        fields: [
          { key: "pets", labelKey: "lifenote.fields.petEntry", type: "repeatable", fields: [
            { key: "name", labelKey: "lifenote.fields.petName", type: "text", placeholderKey: "lifenote.placeholders.petName" },
            { key: "species", labelKey: "lifenote.fields.species", type: "text", placeholderKey: "lifenote.placeholders.species" },
            { key: "birth_date", labelKey: "lifenote.fields.birthDate", type: "text", placeholderKey: "lifenote.placeholders.petBirthDate" },
            { key: "veterinarian", labelKey: "lifenote.fields.veterinarian", type: "text", placeholderKey: "lifenote.placeholders.veterinarian" },
            { key: "food", labelKey: "lifenote.fields.food", type: "text", placeholderKey: "lifenote.placeholders.food" },
            { key: "caretaker", labelKey: "lifenote.fields.caretaker", type: "text", placeholderKey: "lifenote.placeholders.caretaker" },
          ]},
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.petNotes" },
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
        descriptionKey: "lifenote.descriptions.willInfo",
        fields: [
          { key: "has_will", labelKey: "lifenote.fields.hasWill", type: "boolean" },
          { key: "will_location", labelKey: "lifenote.fields.willLocation", type: "text", placeholderKey: "lifenote.placeholders.willLocation" },
          { key: "executor", labelKey: "lifenote.fields.executor", type: "text", placeholderKey: "lifenote.placeholders.executor" },
          { key: "lawyer", labelKey: "lifenote.fields.lawyer", type: "text", placeholderKey: "lifenote.placeholders.lawyer" },
          { key: "notes", labelKey: "lifenote.fields.notes", type: "textarea", placeholderKey: "lifenote.placeholders.willNotes" },
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
        descriptionKey: "lifenote.descriptions.keepsakeInfo",
        fields: [
          { key: "items", labelKey: "lifenote.fields.keepsakeItem", type: "repeatable", fields: [
            { key: "name", labelKey: "lifenote.fields.itemName", type: "text", placeholderKey: "lifenote.placeholders.itemName" },
            { key: "location", labelKey: "lifenote.fields.itemLocation", type: "text", placeholderKey: "lifenote.placeholders.itemLocation" },
            { key: "recipient", labelKey: "lifenote.fields.recipient", type: "text", placeholderKey: "lifenote.placeholders.recipient" },
            { key: "notes", labelKey: "lifenote.fields.notes", type: "text" },
          ]},
          { key: "disposal_wishes", labelKey: "lifenote.fields.disposalWishes", type: "textarea", placeholderKey: "lifenote.placeholders.disposalWishes" },
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
        descriptionKey: "lifenote.descriptions.messageInfo",
        fields: [
          { key: "to_family", labelKey: "lifenote.fields.toFamily", type: "textarea", placeholderKey: "lifenote.placeholders.toFamily" },
          { key: "to_friends", labelKey: "lifenote.fields.toFriends", type: "textarea", placeholderKey: "lifenote.placeholders.toFriends" },
          { key: "gratitude", labelKey: "lifenote.fields.gratitude", type: "textarea", placeholderKey: "lifenote.placeholders.gratitude" },
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
        descriptionKey: "lifenote.descriptions.historyInfo",
        fields: [
          { key: "childhood", labelKey: "lifenote.fields.childhood", type: "textarea", placeholderKey: "lifenote.placeholders.childhood" },
          { key: "school", labelKey: "lifenote.fields.school", type: "textarea", placeholderKey: "lifenote.placeholders.school" },
          { key: "career", labelKey: "lifenote.fields.career", type: "textarea", placeholderKey: "lifenote.placeholders.career" },
          { key: "marriage", labelKey: "lifenote.fields.marriage", type: "textarea", placeholderKey: "lifenote.placeholders.marriage" },
          { key: "memorable_events", labelKey: "lifenote.fields.memorableEvents", type: "textarea", placeholderKey: "lifenote.placeholders.memorableEvents" },
          { key: "lessons", labelKey: "lifenote.fields.lessons", type: "textarea", placeholderKey: "lifenote.placeholders.lessons" },
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
