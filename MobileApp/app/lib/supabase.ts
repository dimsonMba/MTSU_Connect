import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Default export to satisfy expo-router's requirement that files under `app/`
// export a React component as the default. This file is a helper library and
// not a route; returning null keeps behavior unchanged while silencing the
// router warning.
import React from "react";
export default function _SupabaseLibRoute(): null {
  return null;
}
