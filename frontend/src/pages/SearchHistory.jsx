import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { History, Trash2, ArrowRight, Calendar, MapPin, AlertCircle, Scale } from 'lucide-react';
import { getSearchHistory, deleteSearchHistory } from '../services/api';

export default function SearchHistory({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getSearchHistory();
      setHistory(data);
    } catch (err) {
      console.error('History load error:', err);
      setError(err.message || 'Failed to load search history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this search from your history?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteSearchHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete search record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReopen = (item) => {
    navigate('/results', {
      state: {
        results: item.results,
        query: {
          problem_description: item.problem_description,
          category: item.category,
          jurisdiction: item.jurisdiction,
          additional_facts: item.additional_facts,
        },
        search_id: item.id,
      },
    });
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <History size={48} style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Search History Requires Sign-In</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please sign in with your Google account to view and manage your saved legal inquiries.
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
            Your Search History
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Revisit past legal inquiries and analysis generated under Indian jurisprudence.
          </p>
        </div>

        <Link to="/" className="btn btn-primary btn-sm">
          <Scale size={16} />
          <span>New Legal Search</span>
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
          <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Loading your search history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <History size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Searches Recorded Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            When you analyze legal problems on Legal Case Finder AI, your inquiries and results will be securely catalogued here.
          </p>
          <Link to="/" className="btn btn-primary">
            Start Your First Legal Search
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item) => {
            const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
                onClick={() => handleReopen(item)}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span className="badge badge-category">{item.category}</span>
                    <span className="badge badge-jurisdiction">
                      <MapPin size={11} />
                      {item.jurisdiction}
                    </span>
                    <span style={{ fontSize: '0.785rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.problem_description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReopen(item);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>View Results</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deletingId === item.id}
                    className="btn btn-danger btn-sm"
                    title="Delete Search"
                  >
                    <Trash2 size={14} />
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
