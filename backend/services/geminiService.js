import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseRawGeminiResponse, validateAndNormalizeLegalResponse } from '../utils/responseValidator.js';
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * System prompt setting professional, rigorous legal standards for Indian jurisprudence.
 */
const SYSTEM_INSTRUCTION = `You are Legal Case Finder AI, a specialized research assistant for Indian Law and Jurisprudence.
Your primary role is to help users understand the legal dimensions of their problem by identifying potentially applicable Indian statutes, key legal principles, procedural remedies, and landmark or persuasive judicial precedents.

CRITICAL INSTRUCTIONS ON LEGAL ACCURACY, INTEGRITY AND CITATION:
1. FOCUS ON INDIAN JURISPRUDENCE:
   - Apply Indian Law (Central Acts, Codes, and State-specific statutes/amendments when a specific State is specified).
   - Consider recent statutory evolutions (e.g., Bharatiya Nyaya Sanhita 2023, Bharatiya Nagarik Suraksha Sanhita 2023, Specific Relief Amendment Act 2018, Consumer Protection Act 2019, RERA 2016).
2. DISTINGUISH STATUTES FROM JUDICIAL PRECEDENTS:
   - Separate legislative acts and sections from court judgments.
3. ABSOLUTE PROHIBITION ON HALLUCINATED CITATIONS:
   - NEVER invent case names, fake citations, fictional case numbers, imaginary judges, or fabricated dates.
   - If referencing a landmark legal case, only use well-established real landmark decisions of the Supreme Court of India or High Courts (e.g., Kesavananda Bharati, Maneka Gandhi, Suraj Lamp & Industries, Rameshwar Balkrishna, etc.).
   - If an exact official citation or judgment date is not 100% verified in your knowledge base, set "citation": null and "judgment_date": null rather than guessing.
   - ALWAYS set "verification_status": "unverified" for court cases, acknowledging that AI-generated citations require independent verification by legal counsel against official law reports.
4. REMEDIES AND DOCUMENTATION:
   - Provide concrete legal remedies that the user may discuss with a qualified advocate (e.g., temporary injunction under Order XXXIX Rules 1 & 2 CPC, suit for declaration and possession, police complaint, conciliation under RERA).
   - List key evidentiary documents the user should gather.
5. NO DEFINITIVE PROMISES OR LEGAL ADVICE:
   - Clarify that legal outcomes depend heavily on evidence, limitation periods, local municipal rules, and court discretion.
   - Mention important missing facts or ambiguities.
6. RESPONSE FORMAT:
   - You MUST output STRICT VALID JSON matching the required schema with no extraneous markdown or conversational filler.`;

/**
 * Executes the legal research query using the Gemini AI API.
 *
 * @param {Object} queryData
 * @param {string} queryData.problem_description
 * @param {string} queryData.category
 * @param {string} queryData.jurisdiction
 * @param {string} [queryData.additional_facts]
 * @returns {Promise<Object>} Normalized legal research data
 */
export async function performLegalResearch({ problem_description, category, jurisdiction, additional_facts }) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key') {
    throw new Error('GEMINI_API_KEY is not configured on the backend server. Please provide a valid Gemini API key in backend/.env.');
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const userPrompt = `
LEGAL RESEARCH REQUEST:
- Category: ${category || 'General Legal Dispute'}
- Jurisdiction: ${jurisdiction || 'India (General)'}
- Problem Description:
"""
${problem_description}
"""
${additional_facts ? `- Additional Facts & Relevant Dates:\n"""\n${additional_facts}\n"""` : ''}

Please analyze this legal issue under Indian Law and return a JSON object strictly adhering to this structure:
{
  "problem_summary": "Concise legal distillation of the core issue and legal dispute.",
  "jurisdiction": "${jurisdiction || 'India'}",
  "legal_category": "${category || 'General Legal'}",
  "relevant_laws": [
    {
      "name": "Full title of Indian Act/Statute (e.g. Specific Relief Act, 1963)",
      "section": "Applicable Section number and title (e.g. Section 6 - Suit by person dispossessed of immovable property)",
      "explanation": "Why this provision is relevant and what relief or protection it provides.",
      "source_url": "https://www.indiacode.nic.in (or official link if certain, else null)",
      "verification_status": "unverified"
    }
  ],
  "related_cases": [
    {
      "case_title": "Landmark or relevant court judgment title (Only if real and well-known, never invent)",
      "court": "Court name (e.g. Supreme Court of India / High Court)",
      "citation": "Official citation if known, or null if unverified",
      "judgment_date": "Year or date if known, or null",
      "legal_issue": "The core question of law addressed in the case",
      "principle": "Legal ratio decidendi / rule laid down by the court",
      "relevance": "How this principle applies to the user's factual scenario",
      "source_url": null,
      "verification_status": "unverified"
    }
  ],
  "possible_remedies": [
    "Specific legal remedies to discuss with an advocate (e.g., civil suit for injunction, recovery of possession, mandatory notice)"
  ],
  "documents_to_consider": [
    "List of essential evidence, title documents, contracts, or notices to locate"
  ],
  "next_steps": [
    "Recommended practical and legal actions for further research and consultation"
  ],
  "limitations": [
    "Important factual uncertainties, unstated variables, or limitations that could alter the legal analysis"
  ]
}
`;

  let rawText = '';

  try {
    // Attempt using @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    if (response?.text) {
      rawText = typeof response.text === 'function' ? response.text() : response.text;
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = response.candidates[0].content.parts[0].text;
    }
  } catch (sdkError) {
    console.warn('@google/genai execution warning, attempting fallback with @google/generative-ai:', sdkError.message);
    
    // Fallback using @google/generative-ai if needed
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n${userPrompt}`;
      const result = await model.generateContent(fullPrompt);
      const res = await result.response;
      rawText = res.text();
    } catch (fallbackError) {
      console.error('Gemini API call failed completely:', fallbackError);
      // Differentiate error types for clear developer and user feedback
      if (fallbackError.message?.includes('API_KEY_INVALID') || fallbackError.message?.includes('invalid API key')) {
        throw new Error('Invalid Gemini API Key. Please verify your GEMINI_API_KEY in backend/.env.');
      } else if (fallbackError.message?.includes('RESOURCE_EXHAUSTED') || fallbackError.message?.includes('quota')) {
        throw new Error('Gemini API quota exceeded or rate limit reached. Please try again shortly or check your Gemini plan.');
      } else {
        throw new Error(`Gemini AI service error: ${fallbackError.message || sdkError.message}`);
      }
    }
  }

  // Parse and validate the response
  const parsed = parseRawGeminiResponse(rawText);
  const normalized = validateAndNormalizeLegalResponse(parsed, {
    problem_description,
    category,
    jurisdiction,
    additional_facts,
  });

  return normalized;
}
