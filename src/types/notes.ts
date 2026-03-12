import type { NoteType } from "./events";
import type { Json } from "./database";

export type FieldType = "text" | "textarea" | "date" | "select" | "boolean" | "repeatable";

export interface FieldDefinition {
  key: string;
  labelKey: string;
  type: FieldType;
  placeholderKey?: string;
  options?: string[];
  /** Sub-fields for repeatable type */
  fields?: FieldDefinition[];
}

export interface SectionDefinition {
  titleKey: string;
  descriptionKey?: string;
  fields: FieldDefinition[];
}

export interface LifeNoteTemplate {
  type: NoteType;
  titleKey: string;
  icon: string;
  sections: SectionDefinition[];
}

export type LifeNoteBody = Record<string, Json | undefined>;
