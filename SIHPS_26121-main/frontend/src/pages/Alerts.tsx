import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  CheckCircle,
  Copy,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Check,
} from 'lucide-react';
import { fetchAlerts } from '../api';
import type { Alert, AlertsResponse } from '../types';
import { EVENT_TYPE_ICONS, formatDepth, getSeverityClass } from '../utils/constants';
import { useActiveWell } from '../context/ActiveWellContext';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  critical: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    icon: 'text-rose-400',
    glow: 'shadow-rose-500/5',
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    icon: 'text-orange-400',
    glow: 'shadow-orange-500/5',
  },
  medium: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    glow: 'shadow-amber-500/5',
  },
  low: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/5',
  },
};

function AlertCard({
  alert,
  expanded,
  onToggle,
  isAcknowledged,
  onAcknowledge,
}: {
  alert: Alert;
  expanded: boolean;
  onToggle: () => void;
  isAcknowledged: boolean;
  onAcknowledge: () => void;
}) {
  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.low;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isAcknowledged
          ? 'bg-slate-900/60 border-slate-800 opacity-90'
          : `${style.bg} ${style.border} shadow-lg ${style.glow}`
      }`}
    >
      {/* Card Header */}
      <div className="w-full flex items-start gap-3.5 p-4 sm:p-5">
        <button
          className="flex items-start gap-3.5 flex-1 text-left min-w-0 cursor-pointer"
          onClick={onToggle}
          type="button"
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl border ${
              isAcknowledged ? 'bg-slate-900 border-slate-700 text-cyan-400' : `${style.bg} ${style.border}`
            }`}
          >
            {EVENT_TYPE_ICONS[alert.eventType] ?? '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base font-bold text-white">{alert.eventType}</span>
              <span className={getSeverityClass(alert.severity)}>{alert.severity.toUpperCase()}</span>

              {isAcknowledged ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle size={12} /> Acknowledged by Driller
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium">Pending Review</span>
              )}

              <span className="text-xs text-slate-400 ml-auto hidden md:inline font-mono">
                {alert.affectedWellCount} offset well{alert.affectedWellCount !== 1 ? 's' : ''} · {alert.depthRange.min}–{alert.depthRange.max} m
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <button
            type="button"
            onClick={onAcknowledge}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAcknowledged
                ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold shadow-md shadow-cyan-500/20'
            }`}
          >
            <CheckCircle size={13} />
            <span>{isAcknowledged ? 'Signed Off' : 'Acknowledge'}</span>
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-200 pt-4 bg-white">
          {/* Explanation */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <p className="text-xs font-bold text-black mb-1 flex items-center gap-1.5">
              <Info size={14} className="text-cyan-700" />
              <span>Why this alert was triggered:</span>
            </p>
            <p className="text-xs text-black leading-relaxed font-medium">
              Drill bit is currently simulated at <strong className="text-amber-600 font-bold">{formatDepth(alert.currentDepth)}</strong>.
              Historical logs indicate <strong className="text-black font-bold">{alert.affectedWellCount} nearby offset wells</strong> suffered{' '}
              {alert.eventType.toLowerCase()} hazards between{' '}
              <strong className="text-cyan-700 font-bold">{alert.depthRange.min} m and {alert.depthRange.max} m</strong>, matching the{' '}
              <strong className="text-black font-bold">±150 m hazard prediction corridor</strong>.
            </p>
          </div>

          {/* Recommended SOP Mitigation */}
          <div className="bg-white border-2 border-cyan-500/40 rounded-xl p-4 shadow-xs">
            <p className="text-xs font-bold text-cyan-800 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck size={16} className="text-cyan-700" />
              <span>Recommended Operational Mitigation (SOP)</span>
            </p>
            <p className="text-sm text-black font-semibold leading-relaxed">{alert.mitigation}</p>
          </div>

          {/* Contributing offset wells list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-black font-bold uppercase tracking-wider">
                Contributing Offset Incidents ({alert.events.length})
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Sorted by distance</span>
            </div>
            <div className="space-y-1.5">
              {alert.events.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-xs bg-white hover:bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200 transition-colors shadow-xs"
                >
                  <Link
                    to={`/wells/${e.wellId}`}
                    className="text-cyan-700 hover:text-cyan-800 font-bold w-24 flex items-center gap-1 flex-shrink-0"
                    title="View Well Record"
                  >
                    {e.wellName ?? e.wellId}
                    <ExternalLink size={10} />
                  </Link>
                  <span className="text-amber-700 font-mono font-bold">{formatDepth(e.depth)}</span>
                  <span className="text-black font-semibold flex-1 truncate">{e.formation}</span>
                  <span className={getSeverityClass(e.severity)}>{e.severity}</span>
                  {e.distanceKm !== undefined && (
                    <span className="text-black bg-white px-2 py-0.5 rounded-md border border-slate-300 font-mono font-semibold">
                      {e.distanceKm} km away
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Alerts() {
  const { activeWell, activeWellLat, activeWellLng, selectedWellId } = useActiveWell();
  const [depth, setDepth] = useState(2100);
  const [radius, setRadius] = useState(25);
  const [response, setResponse] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high_critical'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  const loadAlerts = useCallback(async (d: number, r: number) => {
    setLoading(true);
    try {
      const data = await fetchAlerts({ depth: d, radius: r, lat: activeWellLat, lng: activeWellLng });
      setResponse(data);
    } finally {
      setLoading(false);
    }
  }, [activeWellLat, activeWellLng]);

  useEffect(() => {
    const d = activeWell?.currentDepth ?? 2100;
    setDepth(d);
    loadAlerts(d, radius);
  }, [selectedWellId, loadAlerts]);

  const handleDepthChange = (newDepth: number) => {
    setDepth(newDepth);
    loadAlerts(newDepth, radius);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    loadAlerts(depth, newRadius);
  };

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rawAlerts = response?.alerts ?? [];

  const filteredAlerts = rawAlerts.filter((a) => {
    if (selectedSeverity === 'critical' && a.severity !== 'critical') return false;
    if (selectedSeverity === 'high_critical' && a.severity !== 'critical' && a.severity !== 'high') return false;
    if (selectedCategory !== 'all' && a.eventType !== selectedCategory) return false;
    return true;
  });

  const criticalCount = rawAlerts.filter((a) => a.severity === 'critical').length;
  const highCount = rawAlerts.filter((a) => a.severity === 'high').length;
  const acknowledgedCount = rawAlerts.filter((a) => acknowledgedAlerts.has(a.id)).length;
  const availableCategories = Array.from(new Set(rawAlerts.map((a) => a.eventType)));

  const handleCopyBriefing = () => {
    const lines = [
      `🚨 OIL INDIA eRTMAC-NWIS — RIG SHIFT SAFETY BRIEFING`,
      `Rig: OIL RIG-14 | Target: DLJ-NEW-01 | Simulated Depth: ${depth} m`,
      `Radius: ${radius} km | Monitored Wells: ${response?.nearbyWellsChecked ?? 0}`,
      `Critical Hazards: ${criticalCount} | High Hazards: ${highCount}`,
      `--------------------------------------------------`,
      ...rawAlerts.map((a, i) => `${i + 1}. [${a.severity.toUpperCase()}] ${a.eventType}: ${a.message}\n   Mitigation: ${a.mitigation}`),
      `--------------------------------------------------`,
      `Exported on: ${new Date().toLocaleString('en-IN')}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2500);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle size={22} className="text-rose-400" />
            <span>Predictive Hazard Engine</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time subsurface hazard anticipation based on historical offset well DDR incidents
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyBriefing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            {copiedBriefing ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedBriefing ? 'Briefing Copied!' : 'Copy Safety Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Controls & Scenario Selector */}
      <div className="glass-card p-5 border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Depth Simulation & Corridors</h3>
              <p className="text-xs text-slate-400">Select geological hazard scenario or drag depth slider</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Current Depth:</span>
            <span className="text-base font-bold text-amber-400 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              {formatDepth(depth)}
            </span>
          </div>
        </div>

        {/* 1-Click Scenario Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Tipam Loss Zone', d: 1240, tag: 'Mud Loss', color: 'border-amber-500/40 text-amber-300' },
            { label: 'Barail Gas Kick', d: 2100, tag: 'Kick (Live)', color: 'border-orange-500/40 text-orange-300' },
            { label: 'Kopili Stuck Pipe', d: 3120, tag: 'Stuck Pipe', color: 'border-rose-500/40 text-rose-300' },
            { label: 'Sylhet Gas Influx', d: 3980, tag: 'High Pressure', color: 'border-rose-500/40 text-rose-300' },
          ].map((sc) => (
            <button
              key={sc.d}
              type="button"
              onClick={() => handleDepthChange(sc.d)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                depth === sc.d
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{sc.label}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-900 border ${sc.color}`}>
                  {sc.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{sc.d} m</p>
            </button>
          ))}
        </div>

        {/* Sliders: Depth & Radius */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-200">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-black font-semibold font-sans">Drill Bit Depth:</span>
              <span className="text-amber-700 font-bold font-sans">{depth} m</span>
            </div>
            <input
              type="range"
              min={100}
              max={activeWell?.plannedTD ?? 4200}
              step={50}
              value={depth}
              onChange={(e) => handleDepthChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #0284c7 0%, #0ea5e9 ${Math.min(100, Math.max(0, ((depth - 100) / ((activeWell?.plannedTD ?? 4200) - 100)) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, ((depth - 100) / ((activeWell?.plannedTD ?? 4200) - 100)) * 100))}%, #e2e8f0 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-black font-semibold font-sans">Offset Well Search Radius:</span>
              <span className="text-cyan-700 font-bold font-sans">{radius} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #0284c7 0%, #0ea5e9 ${Math.min(100, Math.max(0, ((radius - 5) / (60 - 5)) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, ((radius - 5) / (60 - 5)) * 100))}%, #e2e8f0 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200 text-xs">
          <span className="text-black font-semibold font-sans">Filter Severity:</span>
          {[
            { id: 'all', label: `All Events (${rawAlerts.length})` },
            { id: 'critical', label: `🚨 Critical Only (${criticalCount})` },
            { id: 'high_critical', label: `⚠️ High & Critical (${criticalCount + highCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSeverity(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer font-sans ${
                selectedSeverity === tab.id
                  ? 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {availableCategories.length > 1 && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-slate-600 font-medium font-sans">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-black font-sans outline-none cursor-pointer shadow-xs"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Alert Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="kpi-card text-center p-3">
          <span className="text-xs text-slate-400 block mb-0.5">Critical Hazards</span>
          <span className="text-xl font-bold text-rose-400 font-mono">{criticalCount}</span>
        </div>
        <div className="kpi-card text-center p-3">
          <span className="text-xs text-slate-400 block mb-0.5">High Risks</span>
          <span className="text-xl font-bold text-orange-400 font-mono">{highCount}</span>
        </div>
        <div className="kpi-card text-center p-3">
          <span className="text-xs text-slate-400 block mb-0.5">Driller Sign-offs</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{acknowledgedCount}</span>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border-slate-800">
          <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
          <h3 className="text-base font-bold text-white">No Hazards Detected at Current Depth</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No historical offset wells within {radius} km experienced incidents in the ±150 m depth window ({depth - 150}m to {depth + 150}m).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              expanded={expanded === alert.id}
              onToggle={() => setExpanded(expanded === alert.id ? null : alert.id)}
              isAcknowledged={acknowledgedAlerts.has(alert.id)}
              onAcknowledge={() => toggleAcknowledge(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
