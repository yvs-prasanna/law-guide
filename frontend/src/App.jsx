import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SearchResults from './pages/SearchResults';
import CaseDetails from './pages/CaseDetails';
import SearchHistory from './pages/SearchHistory';
import SavedCases from './pages/SavedCases';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase, isSupabaseConfigured } from './services/supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check initial active session
    async function initAuth() {
      if (!isSupabaseConfigured) {
        setAuthLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error reading Supabase session:', error.message);
        }
        setUser(session?.user || null);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    initAuth();

    // Subscribe to session changes (OAuth redirect, sign in, token refresh, sign out)
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setAuthLoading(false);
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  return (
    <div className="app-layout">
      <Navbar user={user} onSignOut={() => setUser(null)} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login user={user} initialMode="signin" />} />
          <Route path="/signup" element={<Login user={user} initialMode="signup" />} />
          <Route path="/register" element={<Login user={user} initialMode="signup" />} />
          <Route path="/results" element={<SearchResults user={user} />} />
          <Route path="/case/details" element={<CaseDetails user={user} />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <SearchHistory user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <SavedCases user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Trust & Legal Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Legal Case Finder AI
            </div>
            <div>
              Specialized research assistant for Indian Law, Statutes, and Judicial Precedents.
            </div>
          </div>

          <div style={{ maxWidth: '540px', fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
            <strong>Notice:</strong> This service is an AI-powered educational and research tool. It does not provide legal representation or legal advice. 
            All citations, judgments, and legal remedies should be independently verified with an advocate licensed under the Advocates Act, 1961.
          </div>
        </div>
      </footer>
    </div>
  );
}
