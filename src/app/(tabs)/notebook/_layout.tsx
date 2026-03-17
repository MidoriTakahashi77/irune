import { Stack } from "expo-router";

export default function NotebookLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="template/[type]" />
      <Stack.Screen name="visibility" />
    </Stack>
  );
}
