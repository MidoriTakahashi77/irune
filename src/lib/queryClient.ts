import { Platform } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import type { Persister } from "@tanstack/react-query-persist-client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (永続化に合わせて延長)
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: true, // focusManager連携: フォアグラウンド復帰時にstaleデータのみ再取得
    },
  },
});

/** expo-file-system ベースの TanStack Query Persister */
function createFileSystemPersister(): Persister {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { File, Paths } = require("expo-file-system");
  const cacheFile = new File(Paths.document, "irune-query-cache.json");

  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingState: string | null = null;

  return {
    persistClient: async (client) => {
      pendingState = JSON.stringify(client);
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        if (pendingState) {
          try {
            cacheFile.write(pendingState);
          } catch {
            // 書き込み失敗は無視（次回リトライ）
          }
          pendingState = null;
        }
      }, 1000);
    },
    restoreClient: async () => {
      try {
        if (!cacheFile.exists) return undefined;
        const data = await cacheFile.text();
        return JSON.parse(data);
      } catch {
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        if (cacheFile.exists) cacheFile.delete();
      } catch {
        // 削除失敗は無視
      }
    },
  };
}

// Web環境ではpersisterを無効化（expo-file-systemはネイティブ専用）
export const fileSystemPersister =
  Platform.OS === "web" ? undefined : createFileSystemPersister();
