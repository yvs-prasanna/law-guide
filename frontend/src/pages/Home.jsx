import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, BookOpen, ShieldCheck, FileCheck, RefreshCw, AlertCircle } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import LoadingSpinner from '../components/LoadingSpinner';
import LegalDisclaimer from '../components/LegalDisclaimer';
import { searchLegalCases } from '../services/api';

export default function Home({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (formData) => {
    setLoading(true);
    setError(null);
    setLastQuery(formData);

    try {
      const response = await searchLegalCases(formData);
      // Navigate to SearchResults page with the research data
      navigate('/results', {
        state: {
          results: response.data,
          query: formData,
          search_id: response.search_id,
        },
      });
    } catch (err) {
      console.error('Legal search error:', err);
      setError(err.message || 'An error occurred while generating legal research.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSearch(lastQuery);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Scale size={14} />
          <span>AI-Powered Indian Legal Research</span>
        </div>

        <h1 className="hero-title legal-heading">
          Find Relevant Laws and Court Judgments for Your Legal Problem
        </h1>

        <p className="hero-subtitle">
          Describe your legal issue in simple language and explore potentially relevant Indian laws, 
          statutory provisions, High Court and Supreme Court precedents, and actionable remedies with AI assistance.
        </p>
      </section>

      {/* Prominent Legal Disclaimer */}
      <div style={{ maxWidth: '860px', margin: '0 auto 2rem' }}>
        <LegalDisclaimer />
      </div>

      {/* Loading or Search Form */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && (
            <div style={{ maxWidth: '860px', margin: '0 auto 1.5rem' }}>
              <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
                {lastQuery && (
                  <button onClick={handleRetry} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                    <RefreshCw size={14} />
                    <span>Retry Search</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <SearchForm onSubmit={handleSearch} loading={loading} user={user} />
        </>
      )}

      {/* Trust & Methodology Information Grid */}
      <section style={{ maxWidth: '980px', margin: '4rem auto 1rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '2rem', color: 'var(--text-main)' }}>
          How Legal Case Finder AI Works
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
              <BookOpen size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Statutory Provisions</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Identifies potentially applicable Central and State acts (e.g. Specific Relief Act, Transfer of Property Act, BNS) and relevant sections.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
              <Scale size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Judicial Precedents</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Highlights landmark rulings of the Supreme Court of India and High Courts, clearly noting verification status to avoid hallucinated citations.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#059669', marginBottom: '0.75rem' }}>
              <FileCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Remedies & Next Steps</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Lists concrete legal remedies, evidentiary documents to assemble, and specific questions to discuss with your advocate.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
