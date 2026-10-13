import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { performLegalResearch } from '../services/geminiService.js';
import historyRoutes from './historyRoutes.js';

const router = express.Router();

// Forward /history and /history/:id to historyRoutes
router.use('/history', historyRoutes);

/**
 * POST /api/legal/search
 * Analyzes legal problem using Gemini AI and stores search record in Supabase.
 */
router.post('/search', requireAuth, async (req, res) => {
  try {
    const { problem_description, category, jurisdiction, additional_facts } = req.body;

    // Request validation
    if (!problem_description || typeof problem_description !== 'string' || problem_description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Problem description is required and cannot be empty.',
      });
    }

    if (problem_description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a more detailed problem description (at least 10 characters) for meaningful legal analysis.',
      });
    }

    const cleanCategory = (category && typeof category === 'string' && category.trim().length > 0)
      ? category.trim()
      : 'General Legal Dispute';

    const cleanJurisdiction = (jurisdiction && typeof jurisdiction === 'string' && jurisdiction.trim().length > 0)
      ? jurisdiction.trim()
      : 'India';

    // Execute Gemini legal analysis
    let researchResults;
    try {
      researchResults = await performLegalResearch({
        problem_description: problem_description.trim(),
        category: cleanCategory,
        jurisdiction: cleanJurisdiction,
        additional_facts: additional_facts ? String(additional_facts).trim() : null,
      });
    } catch (aiError) {
      console.error('Gemini legal research failed:', aiError);
      return res.status(502).json({
        success: false,
        error: aiError.message || 'Failed to generate legal research using AI.',
      });
    }

    // Persist search in Supabase legal_searches
    let searchRecord = null;
    try {
      const { data, error } = await req.supabase
        .from('legal_searches')
        .insert({
          user_id: req.user.id,
          problem_description: problem_description.trim(),
          category: cleanCategory,
          jurisdiction: cleanJurisdiction,
          additional_facts: additional_facts ? String(additional_facts).trim() : null,
          results: researchResults,
        })
        .select()
        .single();

      if (error) {
        console.warn('Database insert warning for legal search:', error.message);
      } else {
        searchRecord = data;
      }
    } catch (dbError) {
      console.warn('Database error while saving search:', dbError.message);
      // We don't fail the user request if saving to history had a transient issue,
      // but we return the AI results so the user's research is not lost.
    }

    return res.status(200).json({
      success: true,
      data: researchResults,
      search_id: searchRecord?.id || null,
      disclaimer: 'This is general legal information for educational and research purposes, not professional legal advice. Consult a qualified advocate before taking legal action.',
    });
  } catch (err) {
    console.error('Unhandled search route error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing the legal search.',
    });
  }
});

/**
 * POST /api/legal/saved-cases
 * Saves a court judgment or precedent bookmark for the authenticated user.
 */
router.post('/saved-cases', requireAuth, async (req, res) => {
  try {
    const { case_title, court, citation, source_url, case_data } = req.body;

    if (!case_title || typeof case_title !== 'string' || case_title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Case title is required to bookmark a case.',
      });
    }

    const { data, error } = await req.supabase
      .from('saved_cases')
      .insert({
        user_id: req.user.id,
        case_title: case_title.trim(),
        court: court ? String(court).trim() : null,
        citation: citation ? String(citation).trim() : null,
        source_url: source_url ? String(source_url).trim() : null,
        case_data: case_data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving case:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save case in database.',
        details: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      data: data,
      message: 'Case successfully saved to your research library.',
    });
  } catch (err) {
    console.error('Saved case create exception:', err);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while saving case.',
    });
  }
});

/**
 * GET /api/legal/saved-cases
 * Retrieves all saved cases belonging to the authenticated user.
 */
router.get('/saved-cases', requireAuth, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('saved_cases')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error retrieving saved cases:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve saved cases from database.',
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error('Saved cases fetch exception:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching saved cases.',
    });
  }
});

/**
 * DELETE /api/legal/saved-cases/:id
 * Removes a saved case if it belongs to the authenticated user.
 */
router.delete('/saved-cases/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Saved case ID is required.',
      });
    }

    const { data, error } = await req.supabase
      .from('saved_cases')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      console.error('Error deleting saved case:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete saved case.',
        details: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Case not found or you do not have permission to delete it.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Case successfully removed from saved items.',
    });
  } catch (err) {
    console.error('Saved case delete exception:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while deleting saved case.',
    });
  }
});

export default router;
