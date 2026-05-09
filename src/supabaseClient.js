import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cvgvrijlsjyqqzrztsqv.supabase.co";
const supabaseAnonKey = "sb_publishable_LMSx2y13bWR5SsQiwLQL6g_OyQCGHx2";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);