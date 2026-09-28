const express = require('express');
const router = express.Router();
const snippets = require('../db/snippets.json');

// GET /api/snippets — full-text search + filters over knowledge base
// Query params: q (text), formation, eventType, wellId, minDepth, maxDepth
router.get('/', (req, res) => {
  const { q, formation, eventType, wellId, minDepth, maxDepth } = req.query;

  let results = [...snippets];

  // Text search (case-insensitive across text and remark fields)
  if (q && q.trim()) {
    const query = q.toLowerCase();
    results = results.filter(
      (s) =>
        s.text.toLowerCase().includes(query) ||
        s.formation.toLowerCase().includes(query) ||
        s.eventType.toLowerCase().includes(query) ||
        s.wellId.toLowerCase().includes(query) ||
        (s.source && s.source.toLowerCase().includes(query))
    );
  }

  // Formation filter
  if (formation && formation !== 'all') {
    results = results.filter((s) =>
      s.formation.toLowerCase().includes(formation.toLowerCase())
    );
  }

  // Event type filter
  if (eventType && eventType !== 'all') {
    results = results.filter((s) =>
      s.eventType.toLowerCase() === eventType.toLowerCase()
    );
  }

  // Well filter
  if (wellId && wellId !== 'all') {
    results = results.filter((s) => s.wellId === wellId);
  }

  // Depth range filter
  if (minDepth) {
    results = results.filter((s) => s.depth >= parseFloat(minDepth));
  }
  if (maxDepth) {
    results = results.filter((s) => s.depth <= parseFloat(maxDepth));
  }

  res.json({
    total: results.length,
    results,
  });
});

// GET /api/snippets/meta — distinct values for filter dropdowns
router.get('/meta', (req, res) => {
  const formations = [...new Set(snippets.map((s) => s.formation))].sort();
  const eventTypes = [...new Set(snippets.map((s) => s.eventType))].sort();
  const wellIds = [...new Set(snippets.map((s) => s.wellId))].sort();
  res.json({ formations, eventTypes, wellIds });
});

module.exports = router;
