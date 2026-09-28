const express = require('express');
const router = express.Router();
const wells = require('../db/wells.json');
const formations = require('../db/formations.json');
const events = require('../db/events.json');
const casings = require('../db/casings.json');

// Helper: haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/wells — all offset wells
router.get('/', (req, res) => {
  res.json(wells);
});

// GET /api/wells/nearby — wells within a radius, with optional state filter
router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || 25;
  const state = req.query.state;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng query params required' });
  }

  let nearby = wells
    .map((w) => ({
      ...w,
      distanceKm: Math.round(haversineDistance(lat, lng, w.lat, w.lng) * 10) / 10,
    }))
    .filter((w) => w.distanceKm <= radius);

  if (state && state !== 'all') {
    nearby = nearby.filter((w) => w.state && w.state.toLowerCase() === state.toLowerCase());
  }

  nearby.sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(nearby);
});

// GET /api/wells/:id — full profile for one well
router.get('/:id', (req, res) => {
  const well = wells.find((w) => w.id === req.params.id);
  if (!well) return res.status(404).json({ error: 'Well not found' });

  const profile = {
    ...well,
    formations: formations[well.id] || [],
    events: events[well.id] || [],
    casingInfo: casings[well.id] || null,
  };
  res.json(profile);
});

// GET /api/events — events for a specific well (or all)
router.get('/:id/events', (req, res) => {
  const wellEvents = events[req.params.id];
  if (!wellEvents) return res.status(404).json({ error: 'Well events not found' });
  res.json(wellEvents);
});

// GET /api/wells/:id/drillingParams — synthetic drilling parameter profile vs depth
router.get('/:id/drilling-params', (req, res) => {
  const well = wells.find((w) => w.id === req.params.id);
  if (!well) return res.status(404).json({ error: 'Well not found' });

  // Generate smooth, realistic geological parameter profiles vs depth
  // seed provides well-specific offsets (e.g. DLJ-01 drills slightly faster than DLJ-02)
  const seed = (well.id.charCodeAt(0) * 3 + well.id.charCodeAt(well.id.length - 1)) % 20;
  const params = [];
  const step = 50;

  for (let depth = 0; depth <= well.totalDepth; depth += step) {
    // Geological formation macro-trends (smooth, low-frequency variance)
    const normDepth = depth / Math.max(1, well.totalDepth);
    const wave1 = Math.sin(depth * 0.0035 + seed);
    const wave2 = Math.cos(depth * 0.007 + seed * 0.5) * 0.5;
    const wave3 = Math.sin(depth * 0.0015 + seed * 1.2) * 0.8;
    const geoFactor = (wave1 + wave2 + wave3) / 2.3; // -1 to +1 smooth transition

    // 1. ROP: Fast in soft Girujan (13-16 m/hr), moderate in Tipam/Barail (8-12 m/hr), slows in Kopili & Sylhet (3-6 m/hr)
    let baseRop = 14.5;
    if (depth > 900 && depth <= 1850) {
      baseRop = 11.2; // Tipam Sandstone
    } else if (depth > 1850 && depth <= 3100) {
      baseRop = 8.6; // Barail Group
    } else if (depth > 3100 && depth <= 3900) {
      baseRop = 5.4; // Kopili Shale
    } else if (depth > 3900) {
      baseRop = 3.8; // Sylhet Limestone
    }
    const wellRopBias = ((seed % 5) - 2) * 0.6;
    const rop = Math.max(1.5, Math.round((baseRop + wellRopBias + geoFactor * 1.8) * 10) / 10);

    // 2. Mud Weight: Engineered hydrostatic gradient program stepping up with formation pore pressure
    let baseMW = 1.10;
    if (depth > 900 && depth <= 1850) {
      baseMW = 1.16;
    } else if (depth > 1850 && depth <= 3100) {
      baseMW = 1.24;
    } else if (depth > 3100 && depth <= 3900) {
      baseMW = 1.34;
    } else if (depth > 3900) {
      baseMW = 1.45;
    }
    const mwVariation = Math.sin(depth * 0.002 + seed) * 0.015;
    const mudWeight = Math.round((baseMW + mwVariation) * 100) / 100;

    // 3. Torque: Increases smoothly with depth due to string drag and wellbore friction
    const baseTorque = 5 + normDepth * 12;
    const torque = Math.max(4.0, Math.round((baseTorque + geoFactor * 1.5) * 10) / 10);

    // 4. WOB: Auto-driller maintains optimal weight on bit (12 to 24 kN)
    const baseWob = 12 + normDepth * 9;
    const wob = Math.max(8.0, Math.round((baseWob + geoFactor * 1.8) * 10) / 10);

    params.push({
      depth,
      rop,
      mudWeight,
      torque,
      wob,
    });
  }

  res.json(params);
});

module.exports = router;
