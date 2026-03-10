import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  category: z.enum(["health", "family", "errands", "social"]).optional(),
  start_at: z.string(),
  end_at: z.string(),
  all_day: z.boolean(),
  notes: z.string().optional(),
  reminders: z.array(z.number()).optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const diarySchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  entry_date: z.string(),
  body: z.string().optional(),
  mood: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type DiaryFormData = z.infer<typeof diarySchema>;

export const magicLinkSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export const displayNameSchema = z.object({
  displayName: z.string().min(1, "表示名を入力してください"),
});

export type DisplayNameFormData = z.infer<typeof displayNameSchema>;

export const relationshipSchema = z.object({
  relationship: z.enum(["spouse", "father", "mother", "grandpa", "grandma", "son", "daughter", "brother", "sister", "other"]),
  relationshipLabel: z.string().optional(),
});

export type RelationshipFormData = z.infer<typeof relationshipSchema>;

export const managedMemberSchema = z.object({
  displayName: z.string().min(1, "名前を入力してください"),
});

export type ManagedMemberFormData = z.infer<typeof managedMemberSchema>;
