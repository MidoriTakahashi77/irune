import { Stack } from "expo-router";

export default function CalendarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new-event" options={{ presentation: "modal" }} />
      <Stack.Screen name="new-diary" options={{ presentation: "modal" }} />
      <Stack.Screen name="edit-event/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="diary/[id]" />
    </Stack>
  );
}
