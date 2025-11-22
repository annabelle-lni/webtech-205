import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Crée l'instance de connexion unique
const supabaseInstance = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 1. Export pour votre page "Créer Compte" (import { supabase } ...)
export const supabase = supabaseInstance

// 2. Export pour votre page "Mon Compte" (const supabase = createClient())
export const createClient = () => supabaseInstance