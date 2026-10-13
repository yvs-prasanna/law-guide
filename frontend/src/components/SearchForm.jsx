import React, { useState } from 'react';
import { Search, Sparkles, MapPin, FolderCheck, Calendar, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Land and Property',
  'Inheritance and Family Property',
  'Rental and Tenancy',
  'Contract Disputes',
  'Consumer Disputes',
  'Employment',
  'Criminal Law',
  'Other',
];

const JURISDICTIONS = [
  'All India (Central Jurisprudence)',
  'Andhra Pradesh',
  'Delhi (NCT)',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab and Haryana',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Other State / Union Territory',
];

const SAMPLE_PROMPTS = [
  {
    label: 'Land Encroachment',
    category: 'Land and Property',
    text: 'My neighbour has occupied a portion of my ancestral agricultural land and erected a fence without my consent. What legal remedies are available to recover possession?',
  },
  {
    label: 'Ancestral Property Partition',
    category: 'Inheritance and Family Property',
    text: 'My father passed away without leaving a will, and my siblings are refusing to divide the ancestral property and agricultural land. How can I seek partition?',
  },
  {
    label: 'Withheld Rental Deposit',
    category: 'Rental and Tenancy',
    text: 'I vacated my rented apartment two months ago after giving proper notice, but my landlord is refusing to return my security deposit without providing any valid deductions.',
  },
  {
    label: 'Fraudulent Property Sale',
    category: 'Land and Property',
    text: 'Someone sold me a residential plot using fabricated power of attorney documents. Another person is now claiming to be the genuine owner.',
  },
];

export default function SearchForm({ onSubmit, loading, user }) {
  const [problemDescription, setProblemDescription] = useState('');
  const [category, setCategory] = useState('Land and Property');
  const [jurisdiction, setJurisdiction] = useState('All India (Central Jurisprudence)');
  const [additionalFacts, setAdditionalFacts] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleApplySample = (sample) => {
    setProblemDescription(sample.text);
    setCategory(sample.category);
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      setValidationError('Please enter a description of your legal problem.');
      return;
    }
    if (problemDescription.trim().length < 15) {
      setValidationError('Please provide a few more details (at least 15 characters) for accurate legal research.');
      return;
    }

    setValidationError('');
    onSubmit({
      problem_description: problemDescription.trim(),
      category,
      jurisdiction,
      additional_facts: additionalFacts.trim(),
    });
  };

  return (
    <div className="card" style={{ maxWidth: '860px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
      <form onSubmit={handleSubmit}>
        {validationError && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Legal Problem Textarea */}
        <div className="form-group">
          <label className="form-label" htmlFor="problem_description">
            Describe Your Legal Problem <span style={{ color: 'var(--accent-gold)' }}>*</span>
          </label>
          <textarea
            id="problem_description"
            className="form-control"
            rows={5}
            placeholder="Describe your legal issue in plain language. For example, my neighbour has occupied a portion of my land, and I want to understand my legal options and relevant Indian court decisions."
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="quick-prompts-wrapper">
          <div className="quick-prompts-title">Example Legal Scenarios (Click to test):</div>
          <div className="quick-prompts-list">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-prompt-chip"
                onClick={() => handleApplySample(sample)}
                disabled={loading}
              >
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category and Jurisdiction */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="legal_category">
              <FolderCheck size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
              Legal Category
            </label>
            <select
              id="legal_category"
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="jurisdiction">
              <MapPin size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
              State or Jurisdiction <span className="optional">(Optional)</span>
            </label>
            <select
              id="jurisdiction"
              className="form-control"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              disabled={loading}
            >
              {JURISDICTIONS.map((jur) => (
                <option key={jur} value={jur}>
                  {jur}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional facts & dates */}
        <div className="form-group">
          <label className="form-label" htmlFor="additional_facts">
            <Calendar size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
            Relevant Dates or Additional Facts <span className="optional">(Optional)</span>
          </label>
          <input
            type="text"
            id="additional_facts"
            className="form-control"
            placeholder="e.g. Registered sale deed dated 2018, legal notice issued on 12 Jan 2024"
            value={additionalFacts}
            onChange={(e) => setAdditionalFacts(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            {user ? (
              <span>✓ Signed in as <strong>{user.email}</strong>. Searches will be saved to your history.</span>
            ) : (
              <span>💡 <a href="/signup" style={{ fontWeight: 600 }}>Create an account</a> or <a href="/login" style={{ fontWeight: 600 }}>sign in</a> to automatically save search results and bookmark cases.</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minWidth: '240px' }}
          >
            <Search size={18} />
            <span>{loading ? 'Analyzing Legal Issue...' : 'Find Relevant Laws and Cases'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
