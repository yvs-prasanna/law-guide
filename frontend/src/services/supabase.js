import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_publishable_key'
);

// Fallback dummy client if credentials aren't configured yet to prevent crashing at startup
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => {
          throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env');
        },
        signInWithPassword: async () => {
          throw new Error('Supabase is not configured.');
        },
        signUp: async () => {
          throw new Error('Supabase is not configured.');
        },
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      }),
    };

/**
 * Signs up a new user using Email and Password.
 */
export async function signUpWithEmail(email, password, fullName = '') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Signs in an existing user using Email and Password.
 */
export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Initiates Supabase Google OAuth flow.
 * Directs user to Google OAuth consent screen with proper redirect URL.
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not set in frontend/.env.');
  }

  const redirectTo = `${window.location.origin}/`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Supabase Google OAuth initiation error:', error);
    throw error;
  }

  return data;
}

/**
 * Signs out the current user and clears session storage.
 */
export async function signOut() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
