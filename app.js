// FitPro ELITE V11 PRO - Supabase configuration
// Keep only the publishable/anon client key here. NEVER put an OpenAI secret in this file.
const SUPABASE_URL = 'https://mbmzxmogkydyotfdajim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xwY6oGTchcUV4GR2P-vKyQ_DdhrYeIm';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
