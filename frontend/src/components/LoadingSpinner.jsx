import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';

const STAGES = [
  'Analyzing your legal problem...',
  'Identifying potentially relevant laws & statutory provisions...',
  'Retrieving relevant Indian judicial precedents...',
  'Preparing your structured legal research summary...',
];

export default function LoadingSpinner() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="spinner" />
      <div className="loading-stage-text">{STAGES[stageIndex]}</div>
      <div className="loading-hint">
        Consulting Indian statutes, High Court, and Supreme Court legal principles via Gemini AI...
      </div>
      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.85rem' }}>
        <Scale size={16} />
        <span>Legal Case Finder AI Processing</span>
      </div>
    </div>
  );
}
