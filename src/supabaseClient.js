import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cvgvrijlsjyqqzrztsqv.supabase.co";
const supabaseAnonKey = "SUA_CHAVE_PUBLICAVEL_COMPLETA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);