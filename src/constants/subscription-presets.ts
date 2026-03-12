export interface SubscriptionPreset {
  name: string;
  category: SubscriptionCategory;
}

export type SubscriptionCategory =
  | "video"
  | "music"
  | "shopping"
  | "mobile"
  | "broadcast"
  | "other";

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  "video",
  "music",
  "shopping",
  "mobile",
  "broadcast",
  "other",
];

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  // 動画
  { name: "Amazon プライム", category: "video" },
  { name: "Netflix", category: "video" },
  { name: "Disney+", category: "video" },
  { name: "Hulu", category: "video" },
  { name: "U-NEXT", category: "video" },
  { name: "DAZN", category: "video" },
  // 音楽
  { name: "Spotify", category: "music" },
  { name: "Apple Music", category: "music" },
  { name: "YouTube Premium", category: "music" },
  { name: "Amazon Music", category: "music" },
  // ショッピング
  { name: "Amazon プライム", category: "shopping" },
  { name: "楽天市場", category: "shopping" },
  { name: "Yahoo!プレミアム", category: "shopping" },
  // 通信
  { name: "楽天モバイル", category: "mobile" },
  { name: "ahamo", category: "mobile" },
  { name: "LINEMO", category: "mobile" },
  { name: "povo", category: "mobile" },
  { name: "UQ mobile", category: "mobile" },
  { name: "Y!mobile", category: "mobile" },
  // 放送
  { name: "NHK", category: "broadcast" },
  { name: "WOWOW", category: "broadcast" },
  { name: "スカパー!", category: "broadcast" },
];
