const express = require('express');
const router = express.Router();
const wells = require('../db/wells.json');
const events = require('../db/events.json');

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

/**
 * MVP RULE-BASED ALERT ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * This implements a proximity-based hazard detection rule:
 *
 *   RULE: For each offset well within `radius` km of the active well,
 *         check if any historical event occurred within ±DEPTH_WINDOW m
 *         of the active well's current depth. If so, raise an alert.
 *
 * Severity mapping:
 *   - critical/high events from ≥2 wells → CRITICAL alert
 *   - high events from 1 well            → HIGH alert
 *   - medium events                      → MEDIUM alert
 *   - low events                         → LOW alert
 *
 * FUTURE ML HOOK: Replace this rule with a gradient-boosted classifier
 * trained on offset-well features (depth, formation, mud weight, ECD,
 * ROP trend, wellbore inclination) to predict P(event | current state).
 * The alert format and UI contract remain unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DEPTH_WINDOW = 150; // metres: look ±150m around current depth

// Mitigation recommendations keyed by event type
const MITIGATIONS = {
  'Kick': 'Monitor pit volumes continuously. Verify mud weight is at planned value. Have kill mud pre-mixed and BOP tested. If flow check positive, shut-in immediately and initiate well kill per kill sheet.',
  'Mud Loss': 'Reduce ECD by optimising flow rate and ROP. Pre-treat mud with LCM (fine mica 15 ppb + graphite 10 ppb). Keep 50 m³ emergency LCM mix on standby. Have cement plug procedure ready.',
  'Stuck Pipe': 'Monitor torque and drag trends in real time. Maintain minimum lubricity in mud (1% lubricant additive). Perform regular wiper trips. Keep 10 m³ spotting oil pill on standby. Do not exceed rotary torque limits.',
  'Torque Spike': 'Reduce WOB and RPM to minimum effective values. Ream problem interval. Circulate PHPA pill if clay balling suspected. Check BHA vibration data.',
  'Cementing Issue': 'Ensure minimum 70% standoff with planned centraliser programme. Use cement spacer with adequate volume. Run CBL post-cementing. Have squeeze cementing materials and pump ready on standby.',
  'NPT': 'Inspect all surface equipment before entering critical intervals. Ensure standby tools/subs are available on rig floor. Conduct thorough pre-job safety checks.',
};

// GET /api/alerts — rule-based alert generation
// Query params: depth (current active well depth), radius (km), lat, lng
router.get('/', (req, res) => {
  const currentDepth = parseFloat(req.query.depth) || 0;
  const radius = parseFloat(req.query.radius) || 25;
  const activeLat = parseFloat(req.query.lat) || 27.374;
  const activeLng = parseFloat(req.query.lng) || 95.318;

  // Step 1: Find offset wells within radius
  const nearbyWells = wells
    .map((w) => ({
      ...w,
      distanceKm: haversineDistance(activeLat, activeLng, w.lat, w.lng),
    }))
    .filter((w) => w.distanceKm <= radius);

  const nearbyWellIds = new Set(nearbyWells.map((w) => w.id));

  // Step 2: Collect all events from nearby wells within depth window
  const matchedEvents = [];

  for (const [wellId, wellEvents] of Object.entries(events)) {
    if (!nearbyWellIds.has(wellId)) continue;

    for (const event of wellEvents) {
      if (Math.abs(event.depth - currentDepth) <= DEPTH_WINDOW) {
        matchedEvents.push({
          ...event,
          wellId,
          wellName: nearbyWells.find((w) => w.id === wellId)?.name || wellId,
          distanceKm: Math.round(nearbyWells.find((w) => w.id === wellId)?.distanceKm * 10) / 10,
          depthDelta: Math.round(event.depth - currentDepth),
        });
      }
    }
  }

  if (matchedEvents.length === 0) {
    return res.json({ alerts: [], summary: 'No hazards detected at current depth within selected radius.' });
  }

  // Step 3: Group matched events by event type to produce consolidated alert cards
  const groupedByType = {};

  for (const event of matchedEvents) {
    if (!groupedByType[event.eventType]) {
      groupedByType[event.eventType] = [];
    }
    groupedByType[event.eventType].push(event);
  }

  // Step 4: Produce one alert card per event type
  const alerts = Object.entries(groupedByType).map(([eventType, evts]) => {
    // Determine severity of this alert card
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const maxSeverity = evts.reduce(
      (max, e) => (severityOrder[e.severity] > severityOrder[max] ? e.severity : max),
      'low'
    );

    const wellNames = [...new Set(evts.map((e) => e.wellName))];
    const depthRange = {
      min: Math.min(...evts.map((e) => e.depth)),
      max: Math.max(...evts.map((e) => e.depth)),
    };
    const formations = [...new Set(evts.map((e) => e.formation))];

    return {
      id: `alert-${eventType.replace(/\s+/g, '-').toLowerCase()}-${currentDepth}`,
      eventType,
      severity: maxSeverity,
      affectedWells: wellNames,
      affectedWellCount: wellNames.length,
      depthRange,
      formations,
      currentDepth,
      message: `${evts.length} event(s) from ${wellNames.length} nearby well(s) (${wellNames.join(', ')}) reported ${eventType} in the ${formations.join(', ')} formation near this depth (${depthRange.min}–${depthRange.max} m).`,
      mitigation: MITIGATIONS[eventType] || 'Review offset well data and consult drilling engineer.',
      events: evts,
    };
  });

  // Sort alerts by severity (critical → high → medium → low)
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  alerts.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

  res.json({
    alerts,
    summary: `${alerts.length} alert type(s) detected at ${currentDepth} m based on ${matchedEvents.length} offset events within ${radius} km.`,
    currentDepth,
    radius,
    nearbyWellsChecked: nearbyWells.length,
  });
});

module.exports = router;
