import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Scale, BookOpen, ShieldAlert, ArrowLeft, Bookmark, 
  ExternalLink, FileCheck, CheckCircle2, AlertTriangle, 
  CornerDownRight, Check 
} from 'lucide-react';
import CaseCard from '../components/CaseCard';
import LegalDisclaimer from '../components/LegalDisclaimer';
import { saveCase } from '../services/api';

export default function SearchResults({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const results = location.state?.results;
  const query = location.state?.query;

  const [savedCaseIds, setSavedCaseIds] = useState(new Set());
  const [saveMessage, setSaveMessage] = useState(null);

  // If page accessed directly without search data, redirect to home
  if (!results) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <Scale size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>No Active Legal Research Results</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please describe your legal issue on the homepage to generate a structured analysis.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Start a New Legal Search</span>
        </Link>
      </div>
    );
  }

  const handleSave = async (caseItem) => {
    if (!user) {
      alert('Please sign in with Google to save court cases to your personal library.');
      navigate('/login');
      return;
    }

    try {
      await saveCase({
        case_title: caseItem.case_title,
        court: caseItem.court,
        citation: caseItem.citation,
        source_url: caseItem.source_url,
        case_data: caseItem,
      });

      setSavedCaseIds((prev) => new Set([...prev, caseItem.case_title]));
      setSaveMessage(`"${caseItem.case_title}" saved to your research library.`);
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save case:', err);
      alert(err.message || 'Error saving case.');
    }
  };

  const handleViewDetails = (caseItem) => {
    navigate('/case/details', {
      state: {
        caseItem,
        userQuery: query,
        problem_summary: results.problem_summary,
      },
    });
  };

  return (
    <div>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Start New Search</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-category">{results.legal_category || query?.category}</span>
          <span className="badge badge-jurisdiction">📍 {results.jurisdiction || query?.jurisdiction}</span>
        </div>
      </div>

      {saveMessage && (
        <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Check size={18} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Prominent Verification Warning */}
      <LegalDisclaimer />

      {/* 1. Problem Summary Banner */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary-navy)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-navy)' }}>
          Legal Problem Analysis & Summary
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
          {results.problem_summary}
        </p>
        {query?.additional_facts && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>Provided Facts / Dates:</strong> {query.additional_facts}
          </div>
        )}
      </div>

      {/* 2. Potentially Relevant Legal Provisions */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <BookOpen size={22} style={{ color: 'var(--primary-navy)' }} />
          <h2 style={{ fontSize: '1.35rem' }}>Potentially Relevant Indian Laws & Statutes</h2>
        </div>

        {results.relevant_laws && results.relevant_laws.length > 0 ? (
          <div>
            {results.relevant_laws.map((law, idx) => (
              <div key={idx} className="law-item">
                <div className="law-header">
                  <div className="law-title">{law.name}</div>
                  <span className={`badge ${law.verification_status === 'verified' ? 'badge-verified' : 'badge-unverified'}`}>
                    {law.verification_status === 'verified' ? '✓ Verified Source' : '⚠️ Statute Reference (Verify)'}
                  </span>
                </div>

                {law.section && (
                  <div className="law-section">
                    Section: <span style={{ color: 'var(--primary-navy)' }}>{law.section}</span>
                  </div>
                )}

                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginBottom: law.source_url ? '0.75rem' : 0 }}>
                  {law.explanation}
                </p>

                {law.source_url && (
                  <a
                    href={law.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                  >
                    <ExternalLink size={13} />
                    <span>View Official Text (India Code)</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-light)' }}>No statutory provisions identified for this query.</p>
        )}
      </section>

      {/* 3. Related Court Judgments / Precedents */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Scale size={22} style={{ color: 'var(--accent-gold)' }} />
          <h2 style={{ fontSize: '1.35rem' }}>Related Court Judgments & Precedents</h2>
        </div>

        {results.related_cases && results.related_cases.length > 0 ? (
          <div>
            {results.related_cases.map((caseItem, idx) => (
              <CaseCard
                key={idx}
                caseItem={caseItem}
                onViewDetails={handleViewDetails}
                onSaveCase={handleSave}
                isSaved={savedCaseIds.has(caseItem.case_title)}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-light)' }}>No specific court precedents retrieved for this specific scenario.</p>
        )}
      </section>

      {/* Grid of Remedies & Evidence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* 4. Possible Legal Remedies */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-navy)' }}>
            <FileCheck size={20} />
            <h3 style={{ fontSize: '1.15rem' }}>Possible Remedies to Discuss with an Advocate</h3>
          </div>
          <ul className="research-list">
            {results.possible_remedies?.map((remedy, idx) => (
              <li key={idx} className="research-list-item">
                <CornerDownRight size={16} className="item-icon" />
                <span>{remedy}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Documents or Evidence to Consider */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
            <BookOpen size={20} />
            <h3 style={{ fontSize: '1.15rem' }}>Essential Documents & Evidence</h3>
          </div>
          <ul className="research-list">
            {results.documents_to_consider?.map((doc, idx) => (
              <li key={idx} className="research-list-item">
                <CheckCircle2 size={16} className="item-icon" style={{ color: '#059669' }} />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. Recommended Next Steps & Limitations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Next Steps */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Recommended Next Steps for Further Research
          </h3>
          <ul className="research-list">
            {results.next_steps?.map((step, idx) => (
              <li key={idx} className="research-list-item">
                <span style={{ fontWeight: 700, color: 'var(--primary-navy)', minWidth: '18px' }}>{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations & Missing Facts */}
        <div className="card" style={{ backgroundColor: '#fffbeb', borderColor: 'var(--accent-gold-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#92400e' }}>
            <ShieldAlert size={20} />
            <h3 style={{ fontSize: '1.15rem', color: '#92400e' }}>Legal Limitations & Factual Variables</h3>
          </div>
          <ul className="research-list">
            {results.limitations?.map((item, idx) => (
              <li key={idx} className="research-list-item" style={{ color: '#78350f' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '4px', color: 'var(--accent-gold)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
        <Link to="/" className="btn btn-primary" style={{ marginRight: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Conduct Another Legal Search</span>
        </Link>
        <Link to="/history" className="btn btn-secondary">
          <span>View Previous Searches in History</span>
        </Link>
      </div>
    </div>
  );
}
