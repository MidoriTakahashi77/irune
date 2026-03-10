import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="set-profile" />
      <Stack.Screen name="create-family" />
      <Stack.Screen name="join-family" />
    </Stack>
  );
}
