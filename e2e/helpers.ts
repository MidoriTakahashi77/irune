import { type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "e2e-test@irune.test";
const TEST_DISPLAY_NAME = "テスト太郎";
const TEST_FAMILY_NAME = "E2Eテスト家族";

/**
 * Supabase Admin client for test setup
 */
function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SECRET_KEY are required"
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Create test user and family, return session tokens
 */
export async function setupTestUser() {
  const supabase = getAdminClient();

  // 1. Create or get test user
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  let userId: string;
  if (existing) {
    userId = existing.id;
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      email_confirm: true,
      user_metadata: { display_name: TEST_DISPLAY_NAME },
    });
    if (error) throw error;
    userId = newUser.user.id;
  }

  // 2. Create or get test family
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", userId)
    .single();

  if (!existingProfile?.family_id) {
    const { data: family, error: famErr } = await supabase
      .from("families")
      .insert({ name: TEST_FAMILY_NAME })
      .select()
      .single();
    if (famErr) throw famErr;

    const { error: profErr } = await supabase.from("profiles").upsert({
      id: userId,
      family_id: family.id,
      display_name: TEST_DISPLAY_NAME,
      role: "admin",
      color: "#208AEF",
      relationship: "father",
    });
    if (profErr) throw profErr;
  }

  // 3. Clean up old test events
  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", userId)
    .single();

  if (profile?.family_id) {
    await supabase.from("events").delete().eq("family_id", profile.family_id);
  }

  // 4. Generate session via password login
  await supabase.auth.admin.updateUserById(userId, {
    password: "e2e-test-password-12345",
  });

  const anonKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (!anonKey) throw new Error("SUPABASE_PUBLISHABLE_KEY is required");

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonClient = createClient(supabaseUrl!, anonKey);
  const { data: signIn, error: signInErr } =
    await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: "e2e-test-password-12345",
    });
  if (signInErr) throw signInErr;

  return {
    accessToken: signIn.session!.access_token,
    refreshToken: signIn.session!.refresh_token,
    userId,
    familyId: profile?.family_id,
  };
}

/**
 * Inject Supabase session into the browser via localStorage
 */
export async function injectSession(
  page: Page,
  accessToken: string,
  refreshToken: string
) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;

  // Supabase stores session in localStorage with key: sb-{project-ref}-auth-token
  const projectRef = supabaseUrl!.match(/\/\/([^.]+)\./)?.[1] || "local";
  const storageKey = `sb-${projectRef}-auth-token`;

  const sessionData = JSON.stringify({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });

  // Navigate first so we're on the right origin, then set localStorage
  await page.goto("/");
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: storageKey, value: sessionData }
  );

  // Reload to pick up the session
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
}
