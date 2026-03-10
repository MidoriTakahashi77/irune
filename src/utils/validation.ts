import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  category: z.enum(["health", "family", "errands", "social"]),
  start_at: z.string(),
  end_at: z.string(),
  all_day: z.boolean(),
  notes: z.string().optional(),
  reminder: z.boolean(),
  reminder_minutes: z.number().optional(),
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

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上にしてください"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上にしてください"),
  displayName: z.string().min(1, "表示名を入力してください"),
  generation: z.enum(["parent", "grandparent", "child"]),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
