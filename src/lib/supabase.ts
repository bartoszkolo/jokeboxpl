import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://pkkjrepnqrrgttkoxcfj.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2pyZXBucXJyZ3R0a294Y2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Nzk4NDksImV4cCI6MjA3MDM1NTg0OX0.qt1SRUr1ZIhQfYy8bZ9jBTMgdv8oQp24Enr11sqMt2Y"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
