import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Calendar,
  MapPin,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Droplets,
  Zap,
  Weight,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { fetchWellProfile, fetchAllWells, fetchDrillingParams } from '../api';
import type { WellProfile, Well, DrillingParam } from '../types';
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_ICONS,
  FORMATION_COLORS,
  formatDepth,
  formatDate,
  getSeverityClass,
} from '../utils/constants';
import SeverityBadge from '../components/SeverityBadge';

function FormationColumn({ formations, totalDepth }: { formations: any[]; totalDepth: number }) {
  return (
    <div className="flex gap-4">
      {/* Stratigraphic color bar */}
      <div className="w-10 flex-shrink-0 flex flex-col">
        {formations.map((f) => {
          const pct = ((f.baseDepth - f.topDepth) / totalDepth) * 100;
          return (
            <div
              key={f.id}
              className="w-full relative border border-slate-700/60 rounded-sm"
              style={{
                height: `${Math.max(pct * 3.5, 24)}px`,
                backgroundColor: `${f.color}35`,
                borderLeft: `4px solid ${f.color}`,
              }}
            >
              <div className="absolute right-full mr-1.5 top-0 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                {f.topDepth}m
              </div>
            </div>
          );
        })}
        <div className="text-[10px] text-slate-500 font-mono mt-1">{totalDepth}m</div>
      </div>

      {/* Formation descriptions */}
      <div className="flex-1 space-y-2">
        {formations.map((f) => {
          return (
            <div
              key={f.id}
              className="relative rounded-xl p-3 border border-slate-800 bg-slate-950/60"
              style={{
                borderLeft: `4px solid ${f.color}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white" style={{ color: f.color }}>
                  {f.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {f.topDepth}–{f.baseDepth} m
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{f.lithology}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DrillTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-slate-300 font-bold mb-1 font-mono">{formatDepth(-d.depth)}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function WellProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wells, setWells] = useState<Well[]>([]);
  const [profile, setProfile] = useState<WellProfile | null>(null);
  const [drillingParams, setDrillingParams] = useState<DrillingParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeParam, setActiveParam] = useState<'rop' | 'mudWeight' | 'torque' | 'wob'>('rop');

  const wellId = id || (wells.length > 0 ? wells[0].id : '');

  useEffect(() => {
    fetchAllWells().then(setWells);
  }, []);

  useEffect(() => {
    if (!wellId) return;
    setLoading(true);
    Promise.all([fetchWellProfile(wellId), fetchDrillingParams(wellId)]).then(
      ([prof, params]) => {
        setProfile(prof);
        setDrillingParams(params);
        setLoading(false);
      }
    );
  }, [wellId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Well record not found.</p>
        <button onClick={() => navigate('/wells')} className="btn-primary mt-4">
          Return to Well Catalog
        </button>
      </div>
    );
  }

  const PARAM_CONFIG = {
    rop: { label: 'ROP (m/hr)', color: '#06B6D4', icon: TrendingDown },
    mudWeight: { label: 'Mud Weight (SG)', color: '#38BDF8', icon: Droplets },
    torque: { label: 'Torque (kN·m)', color: '#F59E0B', icon: Zap },
    wob: { label: 'WOB (kN)', color: '#F8FAFC', icon: Weight },
  };

  const chartData = drillingParams.map((p) => ({
    ...p,
    depth: -p.depth,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header & Quick Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/wells')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <SeverityBadge severity={profile.riskLevel} />
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              {profile.id} · {profile.wellType} · Operator: {profile.operator}
            </p>
          </div>
        </div>

        {/* Well Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
          <span className="text-xs text-slate-400 font-medium">Switch Well:</span>
          <select
            className="bg-transparent text-xs text-cyan-300 font-semibold outline-none cursor-pointer"
            value={wellId}
            onChange={(e) => navigate(`/wells/${e.target.value}`)}
          >
            {wells.map((w) => (
              <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200">
                {w.name} ({w.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Metadata & Formation Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Metadata Card */}
          <div className="glass-card p-4 rounded-xl border-slate-800">
            <h2 className="section-title mb-3">
              <Activity size={16} className="text-cyan-400" />
              <span>Well Information</span>
            </h2>
            <div className="space-y-2 text-xs">
              {[
                { k: 'Well ID', v: profile.id },
                { k: 'Spud Date', v: formatDate(profile.spudDate) },
                { k: 'Total Depth', v: formatDepth(profile.totalDepth) },
                { k: 'Status', v: profile.status },
                { k: 'Well Type', v: profile.wellType },
                { k: 'Coordinates', v: `${profile.lat.toFixed(4)}°N, ${profile.lng.toFixed(4)}°E` },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium font-mono">{v}</span>
                </div>
              ))}
            </div>
            {profile.remarks && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                  Remarks / Summary:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  {profile.remarks}
                </p>
              </div>
            )}
          </div>

          {/* Formation Column */}
          <div className="glass-card p-4 rounded-xl border-slate-800">
            <h2 className="section-title mb-3">
              <Layers size={16} className="text-amber-400" />
              <span>Formation Column</span>
            </h2>
            <FormationColumn
              formations={profile.formations}
              totalDepth={profile.totalDepth}
            />
          </div>
        </div>

        {/* Center Column: DDR Events & Casing Program (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Events Log */}
          <div className="glass-card p-4 rounded-xl border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">
                <AlertTriangle size={16} className="text-rose-400" />
                <span>DDR Incident Log ({profile.events.length})</span>
              </h2>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {profile.events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-900/60 transition-colors text-left cursor-pointer"
                    onClick={() =>
                      setExpandedEvent(expandedEvent === event.id ? null : event.id)
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">{EVENT_TYPE_ICONS[event.eventType] || '⚠️'}</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{event.eventType}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatDepth(event.depth)} · {event.formation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <SeverityBadge severity={event.severity} />
                      {expandedEvent === event.id ? (
                        <ChevronUp size={14} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedEvent === event.id && (
                    <div className="px-3 pb-3 text-xs text-slate-300 space-y-2 bg-slate-900/40 border-t border-slate-800/80 animate-fade-in pt-2">
                      <p className="text-[11px] text-slate-400">Date: {formatDate(event.date)}</p>
                      <div>
                        <strong className="text-slate-200 block text-[11px] mb-0.5">DDR Remark:</strong>
                        <p className="text-slate-300 text-xs leading-relaxed">{event.remark}</p>
                      </div>
                      {event.mitigation && (
                        <div className="bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40 text-cyan-300">
                          <strong className="block text-[10px] text-cyan-400 mb-0.5 uppercase tracking-wide">
                            Mitigation Taken:
                          </strong>
                          <span>{event.mitigation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Casing Program */}
          {profile.casingInfo && profile.casingInfo.casingProgram && (
            <div className="glass-card p-4 rounded-xl border-slate-800">
              <h2 className="section-title mb-3">
                <span>🏗️ Casing & Cementing Program</span>
              </h2>
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Type</th>
                    <th>Shoe Depth</th>
                    <th>TOC</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.casingInfo.casingProgram.map((c, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-white font-mono">{c.size}</td>
                      <td className="text-slate-300">{c.type}</td>
                      <td className="font-mono text-cyan-400">{c.depth} m</td>
                      <td className="font-mono text-slate-400">{c.cementTOC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Depth Drilling Parameter Curves (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-4 rounded-xl border-slate-800">
            <h2 className="section-title mb-3">
              <TrendingDown size={16} className="text-cyan-400" />
              <span>Drilling Parameter Profile</span>
            </h2>

            {/* Parameter toggle buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {(['rop', 'mudWeight', 'torque'] as const).map((param) => {
                const conf = PARAM_CONFIG[param];
                const isActive = activeParam === param;
                return (
                  <button
                    key={param}
                    type="button"
                    onClick={() => setActiveParam(param)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {conf.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Depth curve chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis
                    dataKey={activeParam}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    stroke="#334155"
                  />
                  <YAxis
                    dataKey="depth"
                    tickFormatter={(v) => `${Math.abs(v)}m`}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    stroke="#334155"
                  />
                  <Tooltip content={<DrillTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={activeParam}
                    name={PARAM_CONFIG[activeParam].label}
                    stroke={PARAM_CONFIG[activeParam].color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2 font-mono">
              Y-Axis: Depth downward (m) · X-Axis: {PARAM_CONFIG[activeParam].label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
