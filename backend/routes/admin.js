const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/admin/student-scores
// Sortable and filterable dashboard for administrators or evaluators.
// Completely SQL query-backed using parameterized inputs.
router.get('/student-scores', authenticateToken, async (req, res) => {
  try {
    const { search, targetRole, minScore, maxScore, sortBy, order } = req.query;
    
    const replacements = {};
    let whereClause = '';

    // Search filter (name or email)
    if (search) {
      whereClause += ' AND (s.name LIKE :search OR s.email LIKE :search)';
      replacements.search = `%${search}%`;
    }

    // Role filter
    if (targetRole) {
      whereClause += ' AND s.target_role = :targetRole';
      replacements.targetRole = targetRole;
    }

    // Min overall score filter
    if (minScore !== undefined && minScore !== '') {
      whereClause += ' AND ps.overall_score >= :minScore';
      replacements.minScore = parseInt(minScore, 10);
    }

    // Max overall score filter
    if (maxScore !== undefined && maxScore !== '') {
      whereClause += ' AND ps.overall_score <= :maxScore';
      replacements.maxScore = parseInt(maxScore, 10);
    }

    // Sort column validation
    const allowedSortCols = {
      name: 's.name',
      email: 's.email',
      target_role: 's.target_role',
      overall_score: 'ps.overall_score',
      generated_at: 'ps.generated_at'
    };
    const sortField = allowedSortCols[sortBy] || 's.name';

    // Sort order validation
    const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';

    // Build the query
    // Employs a subquery to join the latest placement_score for every student
    const sqlQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.target_role,
        ps.overall_score,
        ps.generated_at
      FROM students s
      LEFT JOIN (
        SELECT p1.student_id, p1.overall_score, p1.generated_at
        FROM placement_scores p1
        INNER JOIN (
          SELECT student_id, MAX(generated_at) as max_gen
          FROM placement_scores
          GROUP BY student_id
        ) p2 ON p1.student_id = p2.student_id AND p1.generated_at = p2.max_gen
      ) ps ON s.id = ps.student_id
      WHERE 1=1 ${whereClause}
      ORDER BY ${sortField} ${sortOrder};
    `;

    console.log('[Admin Route] Fetching filtered student scores table...');
    const users = await sequelize.query(sqlQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json(users);
  } catch (error) {
    console.error('[Admin Route] Error listing student scores:', error);
    res.status(500).json({ error: 'Failed to query student scores', details: error.message });
  }
});

module.exports = router;
