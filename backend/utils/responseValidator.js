/**
 * Validates and normalizes structured legal research response from Gemini.
 * Ensures strict schema conformity, guards against missing properties,
 * and guarantees legal citations adhere to verification standards.
 */

// Trusted official government / legal repository domains for India
const TRUSTED_DOMAINS = [
  'sci.gov.in',
  'main.sci.gov.in',
  'judgments.ecourts.gov.in',
  'indiacode.nic.in',
  'egazette.gov.in',
  'lawmin.gov.in',
  'highcourt.nic.in',
];

/**
 * Checks if a URL points to an official verified legal repository.
 */
function isTrustedOfficialUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return TRUSTED_DOMAINS.some(domain => parsed.hostname.toLowerCase().endsWith(domain));
  } catch {
    return false;
  }
}

/**
 * Parses raw Gemini output which might be a JSON string or wrapped in markdown code blocks.
 */
export function parseRawGeminiResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid response received from AI model.');
  }

  let cleaned = rawText.trim();
  // Strip markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt to locate JSON object substring
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const extracted = cleaned.substring(firstBrace, lastBrace + 1);
        return JSON.parse(extracted);
      } catch (nestedErr) {
        throw new Error(`Failed to parse AI JSON response: ${nestedErr.message}`);
      }
    }
    throw new Error(`Invalid JSON format in AI response: ${err.message}`);
  }
}

/**
 * Validates and normalizes the parsed legal research object.
 */
export function validateAndNormalizeLegalResponse(parsedData, userContext = {}) {
  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('AI output must be a structured JSON object.');
  }

  // 1. Problem Summary
  const problemSummary = typeof parsedData.problem_summary === 'string' && parsedData.problem_summary.trim().length > 0
    ? parsedData.problem_summary.trim()
    : (userContext.problem_description ? `Summary of legal issue: ${userContext.problem_description.slice(0, 150)}...` : 'Legal issue summary not provided.');

  // 2. Jurisdiction & Category
  const jurisdiction = typeof parsedData.jurisdiction === 'string' && parsedData.jurisdiction.trim().length > 0
    ? parsedData.jurisdiction.trim()
    : (userContext.jurisdiction || 'India');

  const legalCategory = typeof parsedData.legal_category === 'string' && parsedData.legal_category.trim().length > 0
    ? parsedData.legal_category.trim()
    : (userContext.category || 'General Legal Dispute');

  // 3. Relevant Laws
  const rawLaws = Array.isArray(parsedData.relevant_laws) ? parsedData.relevant_laws : [];
  const relevantLaws = rawLaws.map(law => {
    const isUrlTrusted = isTrustedOfficialUrl(law.source_url);
    return {
      name: typeof law.name === 'string' ? law.name.trim() : 'Unspecified Legislation',
      section: law.section ? String(law.section).trim() : null,
      explanation: typeof law.explanation === 'string' ? law.explanation.trim() : 'Potentially applicable statutory provision.',
      source_url: law.source_url && typeof law.source_url === 'string' ? law.source_url.trim() : null,
      verification_status: isUrlTrusted ? 'verified' : 'unverified',
    };
  });

  // 4. Related Court Judgments / Precedents
  // Rule: Gemini internal generation can never be assumed as verified.
  // Unless backed by verified URL from official domain, must be 'unverified'.
  const rawCases = Array.isArray(parsedData.related_cases) ? parsedData.related_cases : [];
  const relatedCases = rawCases.map(item => {
    const isUrlTrusted = isTrustedOfficialUrl(item.source_url);
    const status = isUrlTrusted ? 'verified' : 'unverified';

    return {
      case_title: typeof item.case_title === 'string' && item.case_title.trim()
        ? item.case_title.trim()
        : 'Reference Landmark Principle',
      court: item.court ? String(item.court).trim() : 'Supreme Court / High Court (India)',
      citation: item.citation ? String(item.citation).trim() : null,
      judgment_date: item.judgment_date ? String(item.judgment_date).trim() : null,
      legal_issue: typeof item.legal_issue === 'string' ? item.legal_issue.trim() : 'Legal question relating to dispute',
      principle: typeof item.principle === 'string' ? item.principle.trim() : 'Established legal principle under Indian jurisprudence',
      relevance: typeof item.relevance === 'string' ? item.relevance.trim() : 'Relevant to assessing rights and potential courses of action',
      source_url: item.source_url && typeof item.source_url === 'string' ? item.source_url.trim() : null,
      verification_status: status,
    };
  });

  // 5. String Arrays (Remedies, Documents, Next Steps, Limitations)
  const sanitizeStringArray = (arr, fallback) => {
    if (!Array.isArray(arr)) return [fallback];
    const cleaned = arr
      .filter(item => item && typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim());
    return cleaned.length > 0 ? cleaned : [fallback];
  };

  const possibleRemedies = sanitizeStringArray(
    parsedData.possible_remedies,
    'Consult an advocate to evaluate injunctive relief, civil suit, or mediation options.'
  );

  const documentsToConsider = sanitizeStringArray(
    parsedData.documents_to_consider,
    'Relevant registered agreements, title deeds, correspondence, and identification documents.'
  );

  const nextSteps = sanitizeStringArray(
    parsedData.next_steps,
    'Organize chronology of events and seek formal consultation with a specialized legal practitioner.'
  );

  const limitations = sanitizeStringArray(
    parsedData.limitations,
    'This analysis is based solely on the brief description provided. Local municipal laws, specific evidence, limitation periods, and unstated facts can significantly affect legal outcomes.'
  );

  return {
    problem_summary: problemSummary,
    jurisdiction: jurisdiction,
    legal_category: legalCategory,
    relevant_laws: relevantLaws,
    related_cases: relatedCases,
    possible_remedies: possibleRemedies,
    documents_to_consider: documentsToConsider,
    next_steps: nextSteps,
    limitations: limitations,
  };
}
