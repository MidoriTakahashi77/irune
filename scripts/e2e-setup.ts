/**
 * E2E Test Setup Script
 *
 * Creates a test user and family in Supabase, then outputs a deep link
 * that Maestro can use to inject the session into the app.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SECRET_KEY=sb_secret_... \
 *   bun run scripts/e2e-setup.ts
 *
 * Outputs:
 *   E2E_DEEP_LINK=irune://e2e-auth?access_token=...&refresh_token=...
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_SECRET_KEY are required"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = "e2e-test@irune.test";
const TEST_FAMILY_NAME = "E2Eテスト家族";
const TEST_DISPLAY_NAME = "テスト太郎";

async function setup() {
  console.log("=== E2E Setup Start ===");

  // 1. Create or get test user
  let userId: string;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  if (existing) {
    userId = existing.id;
    console.log(`Test user exists: ${userId}`);
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      email_confirm: true,
      user_metadata: { display_name: TEST_DISPLAY_NAME },
    });
    if (error) throw error;
    userId = newUser.user.id;
    console.log(`Test user created: ${userId}`);
  }

  // 2. Create or get test family
  let familyId: string;
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", userId)
    .single();

  if (existingProfile?.family_id) {
    familyId = existingProfile.family_id;
    console.log(`Test family exists: ${familyId}`);
  } else {
    const { data: family, error: famErr } = await supabase
      .from("families")
      .insert({ name: TEST_FAMILY_NAME })
      .select()
      .single();
    if (famErr) throw famErr;
    familyId = family.id;
    console.log(`Test family created: ${familyId}`);

    // Create profile
    const { error: profErr } = await supabase.from("profiles").upsert({
      id: userId,
      family_id: familyId,
      display_name: TEST_DISPLAY_NAME,
      role: "admin",
      color: "#208AEF",
      relationship: "father",
    });
    if (profErr) throw profErr;
    console.log("Test profile created");
  }

  // 3. Clean up old test events
  const { error: cleanErr } = await supabase
    .from("events")
    .delete()
    .eq("family_id", familyId);
  if (cleanErr) console.warn("Cleanup warning:", cleanErr.message);
  else console.log("Old test events cleaned up");

  // 4. Generate session token
  const { data: session, error: sessionErr } =
    await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: TEST_EMAIL,
    });
  if (sessionErr) throw sessionErr;

  // Extract tokens from the generated link by signing in
  const { data: otpData, error: otpErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: TEST_EMAIL,
  });
  if (otpErr) throw otpErr;

  // Use the token_hash to verify and get a session
  const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${otpData.properties.hashed_token}&type=magiclink&redirect_to=`;
  const verifyRes = await fetch(verifyUrl, { redirect: "manual" });
  const location = verifyRes.headers.get("location") || "";

  // Extract tokens from redirect location
  const hashPart = location.includes("#") ? location.split("#")[1] : "";
  const params = new URLSearchParams(hashPart);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    // Fallback: generate link and create session directly
    console.log("Direct token extraction failed, using admin session...");

    // Use signInWithPassword approach - set a password first
    const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, {
      password: "e2e-test-password-12345",
    });
    if (pwErr) throw pwErr;

    // Create a separate client with anon key for signing in
    const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!anonKey) {
      console.error("SUPABASE_PUBLISHABLE_KEY required for fallback auth");
      process.exit(1);
    }
    const anonClient = createClient(supabaseUrl!, anonKey);
    const { data: signIn, error: signInErr } =
      await anonClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: "e2e-test-password-12345",
      });
    if (signInErr) throw signInErr;

    const deepLink = `irune://e2e-auth?access_token=${signIn.session!.access_token}&refresh_token=${signIn.session!.refresh_token}`;
    console.log("\n=== E2E Setup Complete ===");
    console.log(`E2E_DEEP_LINK=${deepLink}`);
    console.log(`E2E_USER_ID=${userId}`);
    console.log(`E2E_FAMILY_ID=${familyId}`);
    return;
  }

  const deepLink = `irune://e2e-auth?access_token=${accessToken}&refresh_token=${refreshToken}`;
  console.log("\n=== E2E Setup Complete ===");
  console.log(`E2E_DEEP_LINK=${deepLink}`);
  console.log(`E2E_USER_ID=${userId}`);
  console.log(`E2E_FAMILY_ID=${familyId}`);
}

setup().catch((err) => {
  console.error("E2E setup failed:", err);
  process.exit(1);
});
