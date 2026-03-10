import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { ProfileRow } from "@/types/events";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingFamilyId, setPendingFamilyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange:", event, session?.user?.email);
      setSession(session);
      if (session?.user) fetchProfile(session.user);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Handle deep link for magic link token exchange on native
    if (Platform.OS !== "web") {
      const handleDeepLink = ({ url }: { url: string }) => {
        handleIncomingUrl(url);
      };
      const sub = Linking.addEventListener("url", handleDeepLink);

      // Check if app was opened via a deep link
      Linking.getInitialURL().then((url) => {
        if (url) handleIncomingUrl(url);
      });

      return () => {
        subscription.unsubscribe();
        sub.remove();
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  async function handleIncomingUrl(url: string) {
    // Extract family_id from invite links
    const parsed = Linking.parse(url);
    if (parsed.queryParams?.family_id) {
      setPendingFamilyId(parsed.queryParams.family_id as string);
    }

    // Extract tokens from magic link hash fragment
    if (url.includes("access_token") && url.includes("refresh_token")) {
      const params = new URLSearchParams(
        url.includes("#") ? url.split("#")[1] : url.split("?")[1]
      );
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  }

  async function fetchProfile(user: User) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function sendMagicLink(email: string) {
    const redirectTo =
      Platform.OS === "web"
        ? `${window.location.origin}/auth-callback`
        : "http://localhost:8081/auth-callback";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  }

  async function verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    console.log("verifyOtp result:", { data, error });
    if (error) throw error;
  }

  async function setupProfile(displayName: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("setupProfile user:", user?.id);
    if (!user) throw new Error("Not authenticated");

    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    console.log("setupProfile existing:", existing, "selectError:", selectError);

    if (existing) {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);
      console.log("setupProfile update error:", error);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        display_name: displayName,
        role: "member",
        color: getRandomColor(),
      });
      console.log("setupProfile insert error:", error);
      if (error) throw error;
    }

    await fetchProfile(user);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setPendingFamilyId(null);
  }

  function clearPendingFamilyId() {
    setPendingFamilyId(null);
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    pendingFamilyId,
    sendMagicLink,
    verifyOtp,
    setupProfile,
    signOut,
    clearPendingFamilyId,
  };
}

function getRandomColor() {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
