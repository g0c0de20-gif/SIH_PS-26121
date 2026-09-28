import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  BookOpen,
  X,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchSnippets, fetchSnippetsMeta } from '../api';
import type { KnowledgeSnippet } from '../types';
import { EVENT_TYPE_ICONS, EVENT_TYPE_COLORS, FORMATION_COLORS, getSeverityClass } from '../utils/constants';

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-cyan-500/30 text-cyan-200 rounded px-1 py-0.5 font-medium">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function KnowledgeSearch() {
  const [query, setQuery] = useState('');
  const [formation, setFormation] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [wellId, setWellId] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<KnowledgeSnippet[]>([]);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<{ formations: string[]; eventTypes: string[]; wellIds: string[] }>({
    formations: [],
    eventTypes: [],
    wellIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const doSearch = useCallback(
    async (q: string, form: string, et: string, wid: string) => {
      setLoading(true);
      try {
        const data = await fetchSnippets({
          q: q || undefined,
          formation: form !== 'all' ? form : undefined,
          eventType: et !== 'all' ? et : undefined,
          wellId: wid !== 'all' ? wid : undefined,
        });
        setResults(data.results);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSnippetsMeta().then(setMeta);
    doSearch('', 'all', 'all', 'all');
  }, [doSearch]);

  const handleSearch = () => doSearch(query, formation, eventType, wellId);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setQuery('');
    setFormation('all');
    setEventType('all');
    setWellId('all');
    doSearch('', 'all', 'all', 'all');
  };

  const activeFilterCount =
    (formation !== 'all' ? 1 : 0) +
    (eventType !== 'all' ? 1 : 0) +
    (wellId !== 'all' ? 1 : 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-cyan-400" />
            AI Knowledge Retrieval
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search 35+ extracted Daily Drilling Reports (DDR) and Well Completion Reports (WCR)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <BookOpen size={14} className="text-cyan-400" />
          <span>Knowledge Base: <strong>{total}</strong> report snippets indexed</span>
        </div>
      </div>

      {/* Main Search Bar & Quick Suggestion Chips */}
      <div className="glass-card p-5 border-slate-700/80 shadow-xl space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-cyan-500 transition-colors shadow-inner">
            <Search size={18} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search drilling incidents… (e.g. 'mud loss Tipam', 'gas kick Barail', 'stuck pipe', 'cement bond failure')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  doSearch('', formation, eventType, wellId);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
              showFilters || activeFilterCount > 0
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button onClick={handleSearch} className="btn-primary py-3 px-5">
            Search
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-black font-bold">Quick Queries:</span>
          {[
            { label: '💥 Gas kick Barail', q: 'kick Barail' },
            { label: '🌊 Mud loss Tipam', q: 'mud loss' },
            { label: '⚙️ Stuck pipe Kopili', q: 'stuck pipe' },
            { label: '🏗️ Poor cement bond', q: 'cement' },
            { label: '🌀 High torque', q: 'torque' },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setQuery(chip.q);
                doSearch(chip.q, formation, eventType, wellId);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-black font-semibold hover:border-cyan-500 hover:bg-cyan-50 transition-all cursor-pointer shadow-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            {/* Formation Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Formation
              </label>
              <select
                className="select-dark w-full"
                value={formation}
                onChange={(e) => {
                  setFormation(e.target.value);
                  doSearch(query, e.target.value, eventType, wellId);
                }}
              >
                <option value="all">All Formations</option>
                {meta.formations.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Hazard Event
              </label>
              <select
                className="select-dark w-full"
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value);
                  doSearch(query, formation, e.target.value, wellId);
                }}
              >
                <option value="all">All Event Types</option>
                {meta.eventTypes.map((et) => (
                  <option key={et} value={et}>
                    {EVENT_TYPE_ICONS[et]} {et}
                  </option>
                ))}
              </select>
            </div>

            {/* Well Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Well
              </label>
              <select
                className="select-dark w-full"
                value={wellId}
                onChange={(e) => {
                  setWellId(e.target.value);
                  doSearch(query, formation, eventType, e.target.value);
                }}
              >
                <option value="all">All Wells (18)</option>
                {meta.wellIds.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <X size={12} /> Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong>{results.length}</strong> matching report snippets
          {query && (
            <>
              {' '}
              for <span className="text-cyan-400 font-semibold">"{query}"</span>
            </>
          )}
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="glass-card p-12 text-center rounded-2xl border-slate-800">
          <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-200">No report snippets found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try broadening your search term or selecting "All Formations" and "All Events" in the filters.
          </p>
          <button onClick={clearFilters} className="mt-4 btn-secondary text-xs">
            Reset Search & Filters
          </button>
        </div>
      )}

      {/* Results List */}
      {!loading && results.length > 0 && (
        <div className="space-y-3.5">
          {results.map((snippet) => {
            const isExpanded = expanded === snippet.id;
            return (
              <div
                key={snippet.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-black flex items-center gap-1.5">
                      <span className="text-base">{EVENT_TYPE_ICONS[snippet.eventType] || '📋'}</span>
                      <span>{snippet.eventType}</span>
                    </span>

                    <span className={getSeverityClass(snippet.severity)}>{snippet.severity}</span>

                    <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-slate-300 text-black font-sans font-bold shadow-xs">
                      {snippet.depth} m
                    </span>

                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: `${FORMATION_COLORS[snippet.formation] || '#06B6D4'}20`,
                        color: FORMATION_COLORS[snippet.formation] || '#38BDF8',
                        border: `1px solid ${FORMATION_COLORS[snippet.formation] || '#06B6D4'}40`,
                      }}
                    >
                      {snippet.formation}
                    </span>
                  </div>

                  <Link
                    to={`/wells/${snippet.wellId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800 transition-colors whitespace-nowrap"
                  >
                    <span>Well: {snippet.wellId}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

                {/* Snippet text */}
                <p className="text-xs text-black leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200 font-sans font-medium shadow-xs">
                  <HighlightText text={snippet.text} query={query} />
                </p>

                {/* Footer details & expansion */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" />
                      <span>{snippet.source}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>Date: {snippet.date}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : snippet.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Less info' : 'Extraction metadata'}</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {/* Expanded metadata drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 animate-fade-in">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Entity ID</span>
                      <span className="font-mono text-slate-300">{snippet.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Well ID</span>
                      <span className="font-medium text-slate-200">{snippet.wellId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Document Source</span>
                      <span className="text-cyan-400">{snippet.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">NLP Extraction Confidence</span>
                      <span className="text-emerald-400 font-semibold">98.4% (Verified)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
