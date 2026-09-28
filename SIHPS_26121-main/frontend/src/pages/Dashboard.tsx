import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Map,
  Search,
  GitMerge,
  ArrowRight,
  TrendingDown,
  Droplets,
  Zap,
  Gauge,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { fetchAlerts, fetchNearbyWells } from '../api';
import type { Alert, Well } from '../types';
import { formatDepth, getSeverityClass, EVENT_TYPE_ICONS } from '../utils/constants';
import { useActiveWell } from '../context/ActiveWellContext';

// Mini sparkline generator
function makeSparkline(base: number, variance: number, points = 12) {
  return Array.from({ length: points }, (_, i) => ({
    t: i,
    v: +(base + (Math.sin(i * 0.8) * variance + (Math.random() - 0.5) * variance * 0.5)).toFixed(2),
  }));
}

const ROP_DATA = makeSparkline(8.4, 2.5);
const MW_DATA = makeSparkline(1.38, 0.02);
const TORQUE_DATA = makeSparkline(12.3, 2);

const SCENARIOS = [
  { label: 'Surface Clay', depth: 850, formation: 'Girujan Clay', tag: 'Safe', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' },
  { label: 'Loss Zone', depth: 1240, formation: 'Tipam Sandstone', tag: 'Mud Loss', color: 'bg-amber-500/10 border-amber-500/30 text-amber-300' },
  { label: 'Barail Kick', depth: 2100, formation: 'Barail Group', tag: 'High Hazard', color: 'bg-orange-500/10 border-orange-500/30 text-orange-300' },
  { label: 'Stuck Pipe', depth: 3120, formation: 'Kopili Shale', tag: 'Severe Risk', color: 'bg-rose-500/10 border-rose-500/30 text-rose-300' },
  { label: 'Gas Influx', depth: 3980, formation: 'Sylhet Limestone', tag: 'Critical Kick', color: 'bg-rose-500/10 border-rose-500/30 text-rose-300' },
];

export default function Dashboard() {
  const { activeWell, activeWellLat, activeWellLng, selectedWellId } = useActiveWell();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [nearbyWells, setNearbyWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatedDepth, setSimulatedDepth] = useState(2100);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const loadAlertsForDepth = async (depth: number, lat = activeWellLat, lng = activeWellLng) => {
    setAlertsLoading(true);
    try {
      const alertsResp = await fetchAlerts({
        depth,
        radius: 25,
        lat,
        lng,
      });
      setAlerts(alertsResp.alerts);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Re-fetch when the active well changes
  useEffect(() => {
    setLoading(true);
    const depth = activeWell?.currentDepth ?? 2100;
    setSimulatedDepth(depth);
    Promise.all([
      fetchNearbyWells(activeWellLat, activeWellLng, 25),
      fetchAlerts({ depth, radius: 25, lat: activeWellLat, lng: activeWellLng }),
    ])
      .then(([nearby, alertsResp]) => {
        setNearbyWells(nearby);
        setAlerts(alertsResp.alerts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedWellId, activeWellLat, activeWellLng]);

  const handleDepthChange = (depth: number) => {
    setSimulatedDepth(depth);
    loadAlertsForDepth(depth);
  };

  const progressPct = activeWell
    ? Math.round((simulatedDepth / activeWell.plannedTD) * 100)
    : 50;

  const criticalOrHighCount = alerts.filter(
    (a) => a.severity === 'high' || a.severity === 'critical'
  ).length;

  const currentFormation =
    simulatedDepth < 1000
      ? 'Girujan Clay'
      : simulatedDepth < 1800
        ? 'Tipam Sandstone'
        : simulatedDepth < 3000
          ? 'Barail Group'
          : simulatedDepth < 3800
            ? 'Kopili Shale'
            : 'Sylhet Limestone';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading operations dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Welcome & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Operations Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry & offset-well predictive hazard decision support
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBriefing(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Rig Handover Briefing</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>Rig-14 Online</span>
          </div>
        </div>
      </div>

      {/* Hero Interactive Depth Simulation Scrubber */}
      <div className="glass-card p-5 bg-gradient-to-r from-slate-900/90 via-slate-900/90 to-cyan-950/20 border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Interactive Depth Simulation</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Live Predictive Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag the depth slider or select a preset scenario to forecast offset hazards in real time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Current Depth:</span>
            <span className="text-base font-bold text-amber-400 font-mono bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800 shadow-inner">
              {formatDepth(simulatedDepth)}
            </span>
          </div>
        </div>

        {/* Preset scenario buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-4">
          {SCENARIOS.map((s) => {
            const isSelected = simulatedDepth === s.depth;
            return (
              <button
                key={s.depth}
                type="button"
                onClick={() => handleDepthChange(s.depth)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{s.depth} m</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${s.color}`}>
                    {s.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-1">{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* Depth range scrubber */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 font-sans whitespace-nowrap shrink-0">0 m</span>
            <input
              type="range"
              min={100}
              max={4200}
              step={50}
              value={simulatedDepth}
              onChange={(e) => handleDepthChange(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #0284c7 0%, #0ea5e9 ${Math.min(100, Math.max(0, ((simulatedDepth - 100) / (4200 - 100)) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, ((simulatedDepth - 100) / (4200 - 100)) * 100))}%, #e2e8f0 100%)`
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700 font-sans whitespace-nowrap shrink-0">4,200 m (TD)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-700 font-sans px-1">
            <span>Formation: <strong className="text-emerald-700 font-bold">{currentFormation}</strong></span>
            <span className="font-semibold text-slate-800">{progressPct}% of Total Planned Depth</span>
          </div>
        </div>
      </div>

      {/* 4 Crisp Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bit Depth</span>
            <Gauge size={16} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {formatDepth(simulatedDepth)}
          </div>
          <div className="mt-2.5 depth-progress">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {progressPct}% of {formatDepth(activeWell?.plannedTD ?? 4200)} TD
          </p>
        </div>

        {/* Metric 2 */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hazard Forecast</span>
            <AlertTriangle size={16} className={criticalOrHighCount > 0 ? 'text-rose-400' : 'text-emerald-400'} />
          </div>
          <div className={`text-xl font-bold ${criticalOrHighCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {alertsLoading ? '…' : criticalOrHighCount > 0 ? `${criticalOrHighCount} High Risk` : 'Optimal / Safe'}
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            {alerts.length} historical events at depth ±150m
          </p>
        </div>

        {/* Metric 3 */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offset Wells</span>
            <Map size={16} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">
            {nearbyWells.length} Wells
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Monitored within 25 km radius
          </p>
        </div>

        {/* Metric 4 */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Geological Formation</span>
            <Layers size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 truncate">
            {currentFormation}
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Upper Assam stratigraphic column
          </p>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Rig Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                <Activity size={18} className="text-cyan-400" />
                <span>Live Rig Telemetry</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">OIL RIG-14</span>
            </div>

            {/* Parameter mini cards */}
            <div className="space-y-3">
              {[
                {
                  label: 'Rate of Penetration (ROP)',
                  value: `${activeWell?.rop ?? 8.4} m/hr`,
                  desc: 'Drilling penetration velocity',
                  icon: TrendingDown,
                  data: ROP_DATA,
                  color: '#06B6D4',
                },
                {
                  label: 'Mud Weight (MW)',
                  value: `${activeWell?.mudWeight ?? 1.38} SG`,
                  desc: 'Hydrostatic pressure balance',
                  icon: Droplets,
                  data: MW_DATA,
                  color: '#38BDF8',
                },
                {
                  label: 'Rotary Torque',
                  value: `${activeWell?.torque ?? 12.3} kN·m`,
                  desc: 'Drillstring rotational resistance',
                  icon: Zap,
                  data: TORQUE_DATA,
                  color: '#F59E0B',
                },
              ].map(({ label, value, desc, icon: Icon, data, color }) => (
                <div key={label} className="flex items-center gap-3 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800" style={{ color }}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-base font-bold text-white font-mono">{value}</p>
                    <p className="text-[10px] text-slate-400 truncate">{desc}</p>
                  </div>
                  <div className="w-20 h-9">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Parameters Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Weight on Bit (WOB)</span>
                <span className="text-slate-100 font-bold font-mono text-sm">{activeWell?.wob ?? 140} kN</span>
              </div>
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Rotary Speed (RPM)</span>
                <span className="text-slate-100 font-bold font-mono text-sm">{activeWell?.rpm ?? 115} rpm</span>
              </div>
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Standpipe Pump (SPPA)</span>
                <span className="text-slate-100 font-bold font-mono text-sm">{activeWell?.sppa ?? 2850} psi</span>
              </div>
              <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Casing Shoe</span>
                <span className="text-cyan-400 font-bold font-mono text-sm">9-5/8" @ 1,850m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Alerts & Hazards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-400" />
                <h2 className="section-title">Predictive Hazard Feed</h2>
              </div>
              <span className="text-xs text-slate-400">
                Depth Window: ±150m of {formatDepth(simulatedDepth)}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-950/30 rounded-xl border border-slate-800/60">
                <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-slate-200">No Hazards at Current Depth</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  Historical offset wells within 25 km did not encounter major drilling incidents in this zone.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-xl p-3.5 border transition-all ${alert.severity === 'critical'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : alert.severity === 'high'
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : alert.severity === 'medium'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{EVENT_TYPE_ICONS[alert.eventType] || '⚠️'}</span>
                        <span className="text-sm font-bold text-white">{alert.eventType}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({alert.depthRange.min}–{alert.depthRange.max} m)
                        </span>
                      </div>
                      <span className={getSeverityClass(alert.severity)}>{alert.severity}</span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.mitigation && (
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                        <span className="text-cyan-400 font-semibold block mb-0.5">
                          Recommended Mitigation:
                        </span>
                        <span className="text-slate-300">{alert.mitigation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Rule-based hazard prediction active
              </span>
              <Link
                to="/alerts"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>View all predictive alerts</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Modules Hub */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Explore System Modules
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/map"
            className="glass-card p-4 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                <Map size={18} />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Geospatial Map
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Explore 18 offset wells on interactive dark & satellite maps with proximity radius.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-3">
              <span>Open Map</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/wells"
            className="glass-card p-4 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                <Activity size={18} />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Well Profiles
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Complete DDR & WCR historical offset records, formation logs, and casing programs.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-3">
              <span>View Profiles</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/search"
            className="glass-card p-4 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                <Search size={18} />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                AI Knowledge Search
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Instant semantic NLP search across drilling incident reports with formation filters.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-3">
              <span>Search Reports</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/correlation"
            className="glass-card p-4 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                <GitMerge size={18} />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Cross-Well Correlation
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Overlay ROP, mud weights, and torque trends across offset wells with hazard bands.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-3">
              <span>Analyze Trends</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Rig Shift Handover Briefing Modal */}
      {showBriefing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                  OIL
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rig Shift Handover Briefing</h3>
                  <p className="text-xs text-cyan-400">eRTMAC-NWIS · Automated Decision Support Summary</p>
                </div>
              </div>
              <button
                onClick={() => setShowBriefing(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Rig Name</span>
                  <span className="font-bold text-white">{activeWell?.rig ?? 'OIL RIG-14'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Well</span>
                  <span className="font-bold text-cyan-400">{activeWell?.name ?? 'DLJ-NEW-01'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Depth</span>
                  <span className="font-bold text-amber-400 font-mono">{formatDepth(simulatedDepth)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Formation</span>
                  <span className="font-bold text-emerald-400">{currentFormation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mud Weight</span>
                  <span className="font-bold text-blue-400">{activeWell?.mudWeight} SG</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Hazard Forecast</span>
                  <span className={`font-bold ${criticalOrHighCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {alerts.length} Incidents Near Depth
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Active Hazard Advisories at Current Depth
                </h4>
                {alerts.length === 0 ? (
                  <p className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    ✓ No offset well drilling hazards recorded within ±150 m depth window.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.slice(0, 3).map((a) => (
                      <div key={a.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span>{EVENT_TYPE_ICONS[a.eventType] || '⚠️'}</span>
                            <span>{a.eventType}</span>
                          </span>
                          <span className={getSeverityClass(a.severity)}>{a.severity}</span>
                        </div>
                        <p className="text-slate-300 text-xs mb-1.5">{a.message}</p>
                        <p className="text-cyan-300 text-[11px] bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40">
                          <strong>Mitigation:</strong> {a.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">Generated for Shift Supervisor · OIL Upper Assam Asset</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
