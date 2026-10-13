import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/legal/history
 * Returns the authenticated user's previous legal searches.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('legal_searches')
      .select('id, user_id, problem_description, category, jurisdiction, additional_facts, results, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching search history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve search history from database.',
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error('History fetch exception:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching history.',
    });
  }
});

/**
 * DELETE /api/legal/history/:id
 * Deletes a search history record only if it belongs to the authenticated user.
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.supabase;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Search history ID is required.',
      });
    }

    // Verify ownership and delete
    const { data, error } = await supabase
      .from('legal_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error deleting search history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete search history record.',
        details: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Search record not found or you do not have permission to delete it.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Search history entry successfully deleted.',
    });
  } catch (err) {
    console.error('History delete exception:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while deleting search entry.',
    });
  }
});

export default router;
