/**
 * Supabase Client Configuration
 * For authentication and database access
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
})

/**
 * Get current user session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.access_token || null
}

/**
 * Sign in with email
 */
export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

/**
 * Sign up with email
 */
export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

/**
 * Sign out
 */
export async function signOut() {
  return await supabase.auth.signOut()
}
