import { createClient } from "@supabase/supabase-js";
import { TruvexaStore } from "./store";

// Initialize Supabase client dynamically using environment variables or settings
export function getSupabaseClient() {
  const settings = typeof window !== "undefined" ? TruvexaStore.getSettings() : null;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    settings?.supabaseUrl ||
    "https://placeholder-truvexa.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    settings?.supabaseAnonKey ||
    "placeholder-anon-key";

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function isSupabaseConfigured(): boolean {
  if (typeof window === "undefined") {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  const settings = TruvexaStore.getSettings();
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || settings.supabaseUrl) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || settings.supabaseAnonKey)
  );
}
