import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { familyId, senderName } = await req.json();

    if (!familyId || !senderName) {
      return new Response(
        JSON.stringify({ error: "familyId and senderName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user belongs to this family
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("family_id")
      .single();

    if (profileError || profile?.family_id !== familyId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch SOS target contacts with email
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("trusted_contacts")
      .select("name, email, phone")
      .eq("family_id", familyId)
      .eq("is_sos_target", true)
      .not("email", "is", null);

    if (contactsError) throw contactsError;

    const emailContacts = (contacts ?? []).filter((c) => c.email);

    if (emailContacts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No contacts with email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    // Send emails to all emergency contacts
    const results = await Promise.allSettled(
      emailContacts.map((contact) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: Deno.env.get("RESEND_FROM_EMAIL") ?? "irune <noreply@irune.app>",
            to: [contact.email],
            subject: `[緊急SOS] ${senderName}さんから緊急連絡です`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #D32F2F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">緊急SOS</h1>
                </div>
                <div style="padding: 24px; background: #fff; border: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; margin-bottom: 16px;">
                    <strong>${senderName}</strong>さんが緊急SOSを発信しました。
                  </p>
                  <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                    送信日時: ${now}
                  </p>
                  <p style="font-size: 14px; color: #666;">
                    すぐに連絡を取ってください。
                  </p>
                </div>
              </div>
            `,
          }),
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;

    return new Response(
      JSON.stringify({ success: true, sent, total: emailContacts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
