import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { queryClient, fileSystemPersister } from "@/lib/queryClient";
import { setupNetworkHandlers } from "@/lib/network";
import "@/lib/i18n";

// オフライン検知・フォアグラウンド復帰連携を初期化
setupNetworkHandlers();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const content = (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="family" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {fileSystemPersister ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: fileSystemPersister,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
          }}
        >
          {content}
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>
          {content}
        </QueryClientProvider>
      )}
    </GestureHandlerRootView>
  );
}
