import type { Relationship } from "@/types/events";

export const RELATIONSHIP_CONFIG: Record<
  Relationship,
  { labelKey: string; icon: string; hasBirthOrder: boolean }
> = {
  spouse: {
    labelKey: "relationship.spouse",
    icon: "heart",
    hasBirthOrder: false,
  },
  father: {
    labelKey: "relationship.father",
    icon: "man",
    hasBirthOrder: false,
  },
  mother: {
    labelKey: "relationship.mother",
    icon: "woman",
    hasBirthOrder: false,
  },
  grandpa: {
    labelKey: "relationship.grandpa",
    icon: "man",
    hasBirthOrder: false,
  },
  grandma: {
    labelKey: "relationship.grandma",
    icon: "woman",
    hasBirthOrder: false,
  },
  son: {
    labelKey: "relationship.son",
    icon: "person",
    hasBirthOrder: true,
  },
  daughter: {
    labelKey: "relationship.daughter",
    icon: "person",
    hasBirthOrder: true,
  },
  brother: {
    labelKey: "relationship.brother",
    icon: "person",
    hasBirthOrder: true,
  },
  sister: {
    labelKey: "relationship.sister",
    icon: "person",
    hasBirthOrder: true,
  },
  other: {
    labelKey: "relationship.other",
    icon: "person",
    hasBirthOrder: false,
  },
};

export const RELATIONSHIPS = Object.keys(
  RELATIONSHIP_CONFIG
) as Relationship[];

/** 出生順の日本語表示 (1→長, 2→次, 3→三, ...) */
const BIRTH_ORDER_PREFIX: Record<number, string> = {
  1: "長",
  2: "次",
  3: "三",
  4: "四",
  5: "五",
};

const BIRTH_ORDER_EN: Record<number, string> = {
  1: "Eldest",
  2: "Second",
  3: "Third",
  4: "Fourth",
  5: "Fifth",
};

/** relationship + birth_order → 表示名 (例: "長男", "次女") */
export function getRelationshipDisplayJa(
  relationship: Relationship,
  birthOrder?: number | null
): string {
  const labels: Record<Relationship, string> = {
    spouse: "配偶者",
    father: "父",
    mother: "母",
    grandpa: "祖父",
    grandma: "祖母",
    son: "男",
    daughter: "女",
    brother: "兄",
    sister: "姉",
    other: "その他",
  };

  if (birthOrder && RELATIONSHIP_CONFIG[relationship].hasBirthOrder) {
    const prefix = BIRTH_ORDER_PREFIX[birthOrder] ?? `${birthOrder}`;
    return `${prefix}${labels[relationship]}`;
  }

  return labels[relationship];
}

export function getRelationshipDisplayEn(
  relationship: Relationship,
  birthOrder?: number | null
): string {
  const labels: Record<Relationship, string> = {
    spouse: "Spouse",
    father: "Father",
    mother: "Mother",
    grandpa: "Grandfather",
    grandma: "Grandmother",
    son: "Son",
    daughter: "Daughter",
    brother: "Brother",
    sister: "Sister",
    other: "Other",
  };

  if (birthOrder && RELATIONSHIP_CONFIG[relationship].hasBirthOrder) {
    const prefix = BIRTH_ORDER_EN[birthOrder] ?? `${birthOrder}th`;
    return `${prefix} ${labels[relationship]}`;
  }

  return labels[relationship];
}
