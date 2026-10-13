import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

// Global client for auth verification
let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Creates an authenticated Supabase client scoped to the user's JWT.
 * When operations are performed through this client, Supabase RLS policies
 * using auth.uid() are strictly enforced in PostgreSQL.
 */
export const getAuthenticatedSupabaseClient = (accessToken) => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase credentials (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) are missing.');
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Express middleware to verify Supabase JWT token.
 * Extracts Bearer token from Authorization header and verifies it with Supabase Auth.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing.',
      });
    }

    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Supabase is not configured on the backend. Please provide SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env.',
      });
    }

    // Server-side verification with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please sign in again.',
        details: error?.message,
      });
    }

    // Attach verified user and token
    req.user = data.user;
    req.token = token;
    req.supabase = getAuthenticatedSupabaseClient(token);

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication validation error.',
    });
  }
};
