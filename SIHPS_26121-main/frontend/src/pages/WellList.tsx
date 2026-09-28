import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ExternalLink, Search, SortAsc, Filter, Layers, MapPin } from 'lucide-react';
import { fetchAllWells } from '../api';
import type { Well } from '../types';
import { RISK_MARKER_COLORS, formatDepth, formatDate, getSeverityClass, EVENT_TYPE_ICONS } from '../utils/constants';

export default function WellList() {
  const [wells, setWells] = useState<Well[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'riskLevel' | 'totalDepth'>('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllWells().then((data) => {
      setWells(data);
      setLoading(false);
    });
  }, []);

  const filtered = wells
    .filter((w) => {
      const wellState = w.state || 'Assam';
      if (stateFilter !== 'all' && wellState !== stateFilter) return false;

      const matchSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.id.toLowerCase().includes(search.toLowerCase()) ||
        wellState.toLowerCase().includes(search.toLowerCase()) ||
        (w.district && w.district.toLowerCase().includes(search.toLowerCase())) ||
        w.wellType.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterType === 'high-risk') return w.riskLevel === 'high' || w.riskLevel === 'critical';
      if (filterType === 'exploratory') return w.wellType.toLowerCase() === 'exploratory';
      if (filterType === 'development') return w.wellType.toLowerCase() === 'development';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'riskLevel') {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        return (order[b.riskLevel] || 0) - (order[a.riskLevel] || 0);
      }
      if (sortBy === 'totalDepth') return b.totalDepth - a.totalDepth;
      return a.name.localeCompare(b.name);
    });

  const availableStates = Array.from(new Set(wells.map((w) => w.state || 'Assam')));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity size={22} className="text-cyan-400" />
            <span>Offset Well Catalog</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse and inspect 18 historical offset wells across the Upper Assam Basin
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-black bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <span>Total Database: <strong>{wells.length} Wells</strong></span>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="glass-card p-4 border-slate-200 shadow-sm space-y-3 bg-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Search box */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-300 rounded-xl px-3.5 py-2 flex-1 min-w-[240px] max-w-md focus-within:border-cyan-500 transition-colors shadow-xs">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by well name, ID, state, or district…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-black placeholder-slate-400 outline-none w-full"
            />
          </div>

          {/* State Filter dropdown & Sort dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-xs">
              <MapPin size={14} className="text-slate-500" />
              <select
                className="bg-transparent text-xs text-black font-semibold outline-none cursor-pointer"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="all">All States ({wells.length})</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st} ({wells.filter((w) => (w.state || 'Assam') === st).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-xs">
              <SortAsc size={14} className="text-slate-500" />
              <select
                className="bg-transparent text-xs text-black font-semibold outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="name">Sort by Name</option>
                <option value="riskLevel">Sort by Risk Level</option>
                <option value="totalDepth">Sort by Total Depth</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200">
          <span className="text-xs text-black font-bold">Filter By:</span>
          {[
            { id: 'all', label: `All (${wells.length})` },
            { id: 'high-risk', label: `⚠️ High/Critical Risk (${wells.filter((w) => w.riskLevel === 'high' || w.riskLevel === 'critical').length})` },
            { id: 'exploratory', label: `🎯 Exploratory (${wells.filter((w) => w.wellType.toLowerCase() === 'exploratory').length})` },
            { id: 'development', label: `🏗️ Development (${wells.filter((w) => w.wellType.toLowerCase() === 'development').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-400 shadow-xs'
                  : 'bg-white border border-slate-300 text-black hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="text-xs text-black font-medium ml-auto">
            Showing {filtered.length} of {wells.length} wells
          </span>
        </div>
      </div>

      {/* Grid of Wells */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((well) => {
            const wellState = well.state || 'Assam';
            return (
              <Link
                key={well.id}
                to={`/wells/${well.id}`}
                className="glass-card p-4 rounded-xl hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: RISK_MARKER_COLORS[well.riskLevel] }}
                      />
                      <div>
                        <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {well.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">{well.id}</p>
                      </div>
                    </div>
                    <span className={getSeverityClass(well.riskLevel)}>{well.riskLevel}</span>
                  </div>

                  {/* Location badge */}
                  <div className="flex items-center gap-1.5 mb-3 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-white text-black border border-slate-300 font-semibold shadow-xs">
                      {wellState}
                    </span>
                    <span className="text-black font-medium">{well.district ?? 'Upper Assam'}</span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200 mb-3 shadow-sm">
                    <div>
                      <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider">Total Depth</span>
                      <span className="text-black font-bold font-mono text-sm">{formatDepth(well.totalDepth)}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider">Well Type</span>
                      <span className="text-black font-bold">{well.wellType}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider">Spud Date</span>
                      <span className="text-black font-semibold font-mono">{formatDate(well.spudDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider">Status</span>
                      <span className="text-emerald-700 font-bold">{well.status}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Worst Event */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-xs text-black">
                  <div className="flex items-center gap-1.5">
                    <span>{EVENT_TYPE_ICONS[well.worstEvent] || '⚠️'}</span>
                    <span className="text-black font-bold">{well.worstEvent}</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-700 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>View Record</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
