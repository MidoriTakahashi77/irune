import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, familyId, inviterName } = await req.json();

    if (!email || !familyId) {
      return new Response(
        JSON.stringify({ error: "email and familyId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client to use inviteUserByEmail
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === email
    );

    if (existingUser) {
      // Existing user: send magic link with family_id in redirect
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `irune:///invite?family_id=${familyId}`,
        },
      });

      if (error) throw error;

      // Send custom invite email via admin API
      const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `irune:///invite?family_id=${familyId}`,
          data: { family_id: familyId },
        },
      });

      if (otpError) throw otpError;
    } else {
      // New user: invite via Supabase invite
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `irune:///invite?family_id=${familyId}`,
          data: { family_id: familyId },
        }
      );

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
