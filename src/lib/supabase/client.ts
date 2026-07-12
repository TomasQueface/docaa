import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Faltam VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Define-as no .env (ver .env.example).",
  );
}

export const supabase = createClient(url, key);
