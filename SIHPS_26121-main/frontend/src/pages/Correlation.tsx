import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { GitMerge, Info, Sparkles, SlidersHorizontal, Layers, CheckCircle2, RotateCcw, X, Plus } from 'lucide-react';
import { fetchAllWells, fetchDrillingParams, fetchWellProfile } from '../api';
import type { Well, DrillingParam, WellEvent, Formation } from '../types';
import { EVENT_TYPE_COLORS, formatDepth } from '../utils/constants';

const WELL_LINE_COLORS = ['#06B6D4', '#38BDF8', '#F59E0B', '#10B981', '#A855F7'];

const PARAM_OPTIONS = [
  { value: 'rop', label: 'Rate of Penetration (m/hr)', unit: 'm/hr' },
  { value: 'mudWeight', label: 'Mud Weight (SG)', unit: 'SG' },
  { value: 'torque', label: 'Rotary Torque (kN·m)', unit: 'kN·m' },
  { value: 'wob', label: 'Weight on Bit (kN)', unit: 'kN' },
];

const FORMATION_INTERVALS = [
  { name: 'Girujan Clay', top: 0, base: 900, color: '#38BDF8' },
  { name: 'Tipam Sandstone', top: 900, base: 1850, color: '#F59E0B' },
  { name: 'Barail Group', top: 1850, base: 3100, color: '#06B6D4' },
  { name: 'Kopili Shale', top: 3100, base: 3900, color: '#8B5CF6' },
  { name: 'Sylhet Limestone', top: 3900, base: 4500, color: '#10B981' },
];

function getFormationAtDepth(d: number) {
  return FORMATION_INTERVALS.find((f) => d >= f.top && d <= f.base)?.name ?? 'Subsurface';
}

interface WellData {
  well: Well;
  params: DrillingParam[];
  events: WellEvent[];
  formations: Formation[];
}

function CorrelationTooltip({ active, payload, label, paramUnit }: any) {
  if (!active || !payload?.length) return null;
  const formation = getFormationAtDepth(Number(label));

  return (
    <div className="bg-[#ffffff] border border-slate-700 rounded-xl p-3 text-xs shadow-2xl min-w-44 z-50">
      <div className="border-b border-slate-800 pb-1.5 mb-2">
        <p className="text-white font-bold font-mono text-sm">{formatDepth(Number(label))}</p>
        <p className="text-cyan-400 text-[11px] font-medium">{formation}</p>
      </div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-slate-300 font-medium">{p.name}:</span>
            </div>
            <span className="text-white font-mono font-bold">
              {p.value} <span className="text-slate-400 font-normal text-[10px]">{paramUnit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Correlation() {
  const [allWells, setAllWells] = useState<Well[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wellDataMap, setWellDataMap] = useState<Record<string, WellData>>({});
  const [param, setParam] = useState<'rop' | 'mudWeight' | 'torque' | 'wob'>('rop');
  const [loading, setLoading] = useState(false);
  const [depthMin, setDepthMin] = useState(500);
  const [depthMax, setDepthMax] = useState(4200);

  useEffect(() => {
    fetchAllWells().then((wells) => {
      setAllWells(wells);
      const defaults = wells.slice(0, 3).map((w) => w.id);
      setSelectedIds(defaults);
      loadWellData(defaults);
    });
  }, []);

  const loadWellData = async (ids: string[]) => {
    setLoading(true);
    const entries = await Promise.all(
      ids.map(async (id) => {
        const [profile, params] = await Promise.all([
          fetchWellProfile(id),
          fetchDrillingParams(id),
        ]);
        return [id, { well: profile, params, events: profile.events, formations: profile.formations }] as [string, WellData];
      })
    );
    setWellDataMap(Object.fromEntries(entries));
    setLoading(false);
  };

  const addWell = (id: string) => {
    if (selectedIds.includes(id) || selectedIds.length >= 5) return;
    const next = [...selectedIds, id];
    setSelectedIds(next);
    loadWellData(next);
  };

  const removeWell = (id: string) => {
    const next = selectedIds.filter((s) => s !== id);
    setSelectedIds(next);
    setWellDataMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Merge param data across selected wells
  const mergedData: Record<number, any> = {};
  selectedIds.forEach((id) => {
    const data = wellDataMap[id];
    if (!data) return;
    data.params
      .filter((p) => p.depth >= depthMin && p.depth <= depthMax)
      .forEach((p) => {
        if (!mergedData[p.depth]) mergedData[p.depth] = { depth: p.depth };
        mergedData[p.depth][id] = p[param];
      });
  });
  const chartData = Object.values(mergedData).sort((a, b) => a.depth - b.depth);

  const activeParamMeta = PARAM_OPTIONS.find((p) => p.value === param) || PARAM_OPTIONS[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GitMerge size={22} className="text-cyan-400" />
            <span>Cross-Well Depth Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare drilling telemetry parameters across multiple offset wells by formation depth
          </p>
        </div>
      </div>

      {/* Control Card */}
      <div className="glass-card p-5 border-slate-700/80 shadow-xl space-y-4">
        {/* Selected Wells Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selected Wells ({selectedIds.length}/5):
            </span>
            {selectedIds.map((id, index) => {
              const well = wellDataMap[id]?.well || allWells.find((w) => w.id === id);
              const color = WELL_LINE_COLORS[index % WELL_LINE_COLORS.length];
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border bg-slate-900 border-slate-700/80 text-white shadow-sm"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{well?.name || id}</span>
                  {selectedIds.length > 1 && (
                    <button
                      onClick={() => removeWell(id)}
                      className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add well selector if under limit */}
            {selectedIds.length < 5 && (
              <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1">
                <Plus size={12} className="text-cyan-400" />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addWell(e.target.value);
                  }}
                  className="bg-transparent text-xs text-cyan-300 font-semibold outline-none cursor-pointer"
                >
                  <option value="" disabled>+ Add offset well</option>
                  {allWells
                    .filter((w) => !selectedIds.includes(w.id))
                    .map((w) => (
                      <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200">
                        {w.name} ({w.id})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Parameter Selector Pills & Depth Sliders */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">Parameter:</span>
            {PARAM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParam(opt.value as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${param === opt.value
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Depth Range:</span>
            <input
              type="number"
              value={depthMin}
              onChange={(e) => setDepthMin(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 w-20 text-white font-mono outline-none"
            />
            <span>to</span>
            <input
              type="number"
              value={depthMax}
              onChange={(e) => setDepthMax(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 w-20 text-white font-mono outline-none"
            />
            <span>m</span>
          </div>
        </div>
      </div>

      {/* Main Correlation Chart */}
      <div className="glass-card p-6 border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{activeParamMeta.label}</span>
            <span>vs Depth across {selectedIds.length} wells</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="depth"
                  tickFormatter={(v) => `${v}m`}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  stroke="#334155"
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  stroke="#334155"
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CorrelationTooltip paramUnit={activeParamMeta.unit} />} />
                <Legend
                  wrapperStyle={{ paddingTop: '15px' }}
                  formatter={(value) => {
                    const w = wellDataMap[value]?.well || allWells.find((item) => item.id === value);
                    return <span className="text-slate-300 font-semibold text-xs ml-1">{w?.name || value}</span>;
                  }}
                />
                {selectedIds.map((id, index) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={WELL_LINE_COLORS[index % WELL_LINE_COLORS.length]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
