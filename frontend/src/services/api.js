import { supabase, isSupabaseConfigured } from './supabase.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Retrieves the current session's JWT token for backend authorization.
 */
async function getAuthToken() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet. Please configure your Supabase credentials in frontend/.env to enable authenticated requests.');
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('You must be signed in to perform this operation. Please sign in with Google.');
  }

  return session.access_token;
}

/**
 * Helper to build authenticated fetch headers.
 */
async function buildHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getAuthToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Checks backend health status.
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error(`Health check returned status ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Backend health check failed:', err);
    return { status: 'offline', error: err.message };
  }
}

/**
 * Submits a legal problem to the backend for Gemini-powered research.
 *
 * @param {Object} payload
 * @param {string} payload.problem_description
 * @param {string} payload.category
 * @param {string} payload.jurisdiction
 * @param {string} [payload.additional_facts]
 */
export async function searchLegalCases({ problem_description, category, jurisdiction, additional_facts }) {
  const headers = await buildHeaders(true);

  const response = await fetch(`${API_BASE_URL}/legal/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      problem_description,
      category,
      jurisdiction,
      additional_facts,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Search request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Retrieves the authenticated user's search history.
 */
export async function getSearchHistory() {
  const headers = await buildHeaders(true);

  const response = await fetch(`${API_BASE_URL}/legal/history`, {
    method: 'GET',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to retrieve search history.');
  }

  return data.data || [];
}

/**
 * Deletes a search history record belonging to the authenticated user.
 */
export async function deleteSearchHistory(id) {
  const headers = await buildHeaders(true);

  const response = await fetch(`${API_BASE_URL}/legal/history/${id}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete search record.');
  }

  return data;
}

/**
 * Saves a court case or precedent to the authenticated user's library.
 */
export async function saveCase(casePayload) {
  const headers = await buildHeaders(true);

  const response = await fetch(`${API_BASE_URL}/legal/saved-cases`, {
    method: 'POST',
    headers,
    body: JSON.stringify(casePayload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to save case.');
  }

  return data.data;
}

/**
 * Retrieves all cases saved by the authenticated user.
 */
export async function getSavedCases() {
  const headers = await buildHeaders(true);

  const response = await fetch(`${API_BASE_URL}/legal/saved-cases`, {
    method: 'GET',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to retrieve saved cases.');
  }

  return data.data || [];
}

/**
 * Deletes a saved case by ID.
 */
export async function deleteSavedCase(id) {
  const headers = await buildHeaders(true);

  const response = await fetch(`${API_BASE_URL}/legal/saved-cases/${id}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete saved case.');
  }

  return data;
}
