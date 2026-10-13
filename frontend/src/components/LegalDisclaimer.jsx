import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function LegalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="legal-disclaimer-box" style={{ padding: '0.65rem 0.9rem', marginBottom: '1.25rem' }}>
        <AlertTriangle size={18} className="disclaimer-icon" />
        <div className="disclaimer-text" style={{ fontSize: '0.825rem' }}>
          <strong>Research Disclaimer:</strong> General legal information only; not formal legal advice. AI citations require independent verification with a qualified advocate.
        </div>
      </div>
    );
  }

  return (
    <div className="legal-disclaimer-box">
      <AlertTriangle size={24} className="disclaimer-icon" />
      <div className="disclaimer-text">
        <div className="disclaimer-title">Legal Information & Verification Notice</div>
        <p style={{ margin: 0, color: 'inherit' }}>
          Legal Case Finder AI provides structured legal research and statutory summaries for informational and educational purposes only. 
          This tool does <strong>not</strong> provide legal advice, establish an advocate-client relationship, or guarantee legal outcomes. 
          Judicial precedents, case references, and statutory sections must be independently verified against official government law reports (e.g., India Code, Supreme Court of India repository). 
          Always consult an advocate licensed with the State Bar Council regarding specific legal matters.
        </p>
      </div>
    </div>
  );
}
