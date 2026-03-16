import { AppState, Platform } from "react-native";
import { onlineManager, focusManager } from "@tanstack/react-query";
import * as Network from "expo-network";

/**
 * TanStack Query をネイティブのネットワーク状態・AppState と連携させる。
 * - オフライン時はクエリの発行を自動停止 → キャッシュのみで動作
 * - オンライン復帰時にキューに溜まったクエリを自動再実行
 * - フォアグラウンド復帰時にstaleクエリを再取得
 *
 * 災害時のバッテリー節約に重要:
 * バックグラウンドでは一切のネットワークリクエストが発生しない
 */
export function setupNetworkHandlers() {
  if (Platform.OS === "web") return;

  // ── onlineManager: ネットワーク状態 → TanStack Query ──
  // 初期状態を設定
  Network.getNetworkStateAsync().then((state) => {
    onlineManager.setOnline(state.isInternetReachable ?? true);
  });

  // ネットワーク変化をリアルタイム反映
  Network.addNetworkStateListener((state) => {
    onlineManager.setOnline(state.isInternetReachable ?? true);
  });

  // ── focusManager: AppState → TanStack Query ──
  // フォアグラウンド復帰時のみstaleクエリを再取得
  AppState.addEventListener("change", (state) => {
    focusManager.setFocused(state === "active");
  });
}
