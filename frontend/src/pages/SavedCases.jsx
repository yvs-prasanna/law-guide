import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink, FileText, AlertCircle, Scale } from 'lucide-react';
import { getSavedCases, deleteSavedCase } from '../services/api';

export default function SavedCases({ user }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedCases();
  }, [user]);

  const loadSavedCases = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getSavedCases();
      setCases(data);
    } catch (err) {
      console.error('Saved cases load error:', err);
      setError(err.message || 'Failed to load saved cases.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove "${title}" from your saved cases?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteSavedCase(id);
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to remove saved case.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (item) => {
    navigate('/case/details', {
      state: {
        caseItem: item.case_data || {
          case_title: item.case_title,
          court: item.court,
          citation: item.citation,
          source_url: item.source_url,
          verification_status: 'unverified',
        },
      },
    });
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <Bookmark size={48} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Saved Cases Library</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please sign in with Google to bookmark court judgments and review them later.
          </p>
          <Link to="/login" className="btn btn-primary">
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="legal-heading" style={{ fontSize: '1.8rem' }}>
            Saved Court Judgments
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Your bookmarked Indian court cases and judicial references.
          </p>
        </div>

        <Link to="/" className="btn btn-primary btn-sm">
          <Scale size={16} />
          <span>Search More Cases</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Loading your saved cases...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Bookmark size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Cases Saved Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            When browsing legal search results, click "Save Case" on any precedent card to bookmark it here for consultation with your advocate.
          </p>
          <Link to="/" className="btn btn-primary">
            Find Legal Cases
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cases.map((item) => {
            const caseData = item.case_data || {};
            const isVerified = caseData.verification_status === 'verified';

            return (
              <div key={item.id} className="case-card" style={{ marginBottom: 0 }}>
                <div className="case-card-header">
                  <div>
                    <h3 className="case-title">{item.case_title}</h3>
                    <div className="case-court-meta" style={{ marginTop: '0.35rem' }}>
                      <span>🏛️ {item.court || 'Court not specified'}</span>
                      {item.citation && <span>📜 {item.citation}</span>}
                    </div>
                  </div>

                  <div>
                    {isVerified ? (
                      <span className="badge badge-verified">✓ Verified Source</span>
                    ) : (
                      <span className="badge badge-unverified">⚠️ Unverified Reference</span>
                    )}
                  </div>
                </div>

                {caseData.principle && (
                  <div style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <strong>Legal Ratio:</strong> {caseData.principle}
                  </div>
                )}

                <div className="case-card-actions">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} />
                    <span>View Case Details</span>
                  </button>

                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <ExternalLink size={14} />
                      <span>Open Source</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleRemove(item.id, item.case_title)}
                    disabled={deletingId === item.id}
                    className="btn btn-danger btn-sm"
                    style={{ marginLeft: 'auto' }}
                  >
                    <Trash2 size={14} />
                    <span>Remove from Library</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
