import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Activity,
  Search,
  GitMerge,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  ShieldAlert,
  Database,
  Crosshair,
  Compass,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useActiveWell } from '../context/ActiveWellContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true, subtitle: 'Real-time telemetry & simulation' },
  { to: '/map', icon: Map, label: 'Geospatial Map', subtitle: '18 offset wells & proximity radius' },
  { to: '/wells', icon: Activity, label: 'Well Profiles', subtitle: 'Historical records & lithology' },
  { to: '/search', icon: Search, label: 'Knowledge Search', subtitle: 'AI search over DDR & reports' },
  { to: '/correlation', icon: GitMerge, label: 'Cross-Well Correlation', subtitle: 'Depth parameter overlays' },
  { to: '/alerts', icon: AlertTriangle, label: 'Predictive Alerts', badge: 'Active', subtitle: 'Hazard forecasting engine' },
  { to: '/ingest', icon: Upload, label: 'Doc Ingest', subtitle: 'Automated entity extraction' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showWellPicker, setShowWellPicker] = useState(false);
  const [wellSearch, setWellSearch] = useState('');
  const [guideTab, setGuideTab] = useState<'architecture' | 'tour' | 'glossary'>('architecture');
  const location = useLocation();
  const { activeWell, allWells, selectedWellId, selectWell } = useActiveWell();

  return (
    <div className="flex h-screen overflow-hidden bg-[#ffffff] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col flex-shrink-0 bg-[#ffffff] border-r border-slate-200 transition-all duration-300 z-30 select-none ${collapsed ? 'w-16' : 'w-64'
          }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 min-h-[64px]">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <span className="text-white font-black text-xs tracking-wider">OIL</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 font-bold text-sm tracking-tight">eRTMAC</span>
                <span className="text-xs px-1.5 py-0.2 font-semibold rounded bg-cyan-50 text-cyan-800 border border-cyan-300">
                  NWIS
                </span>
              </div>
              <p className="text-slate-500 text-[11px] truncate mt-0.5">Offset Well Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${isActive
                  ? 'bg-cyan-50 text-cyan-800 font-semibold border border-cyan-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-cyan-700' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="truncate">{label}</span>
                      {badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 ml-2">
                          {badge}
                        </span>
                      )}
                    </div>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-xl">
                      {label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Active Well Selector */}
        <div className="px-3 py-3 border-t border-slate-200 bg-slate-50/80 relative">
          <button
            onClick={() => { if (!collapsed) setShowWellPicker(!showWellPicker); }}
            className={`w-full flex items-center gap-2.5 rounded-xl p-2 transition-all cursor-pointer hover:bg-slate-200/60 ${collapsed ? 'justify-center' : ''
              }`}
            title={collapsed ? `Active: ${activeWell?.name ?? 'Select Well'}` : undefined}
          >
            <div className="relative flex-shrink-0">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block" />
              <span className="absolute -inset-0.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-emerald-700 font-semibold tracking-wider uppercase">ACTIVE WELL</p>
                  <ChevronDown size={12} className={`text-slate-500 transition-transform ${showWellPicker ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-xs text-slate-800 font-semibold truncate">
                  {activeWell?.name ?? 'Select a well…'}
                </p>
              </div>
            )}
          </button>

          {/* Well Picker Dropdown */}
          {showWellPicker && !collapsed && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#ffffff] border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up">
              <div className="p-3 border-b border-slate-200 bg-slate-50">
                <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider mb-2">Switch Active Well</p>
                <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus-within:border-cyan-500 transition-colors">
                  <Search size={13} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search wells…"
                    value={wellSearch}
                    onChange={(e) => setWellSearch(e.target.value)}
                    className="bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none w-full"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {/* Default active well option */}
                <button
                  onClick={() => { selectWell('DLJ-NEW-01'); setShowWellPicker(false); setWellSearch(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${selectedWellId === 'DLJ-NEW-01'
                    ? 'bg-cyan-50 text-cyan-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-600 flex-shrink-0 ring-2 ring-cyan-400/30" />
                  <div className="min-w-0">
                    <span className="block truncate font-semibold">Duliajan-New-01</span>
                    <span className="block text-[10px] text-slate-500 font-mono">DLJ-NEW-01 · Active Drilling</span>
                  </div>
                </button>

                <div className="h-px bg-slate-200 mx-3 my-1" />

                {/* Historical wells */}
                {allWells
                  .filter((w) => {
                    if (!wellSearch.trim()) return true;
                    const q = wellSearch.toLowerCase();
                    return w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || (w.state ?? '').toLowerCase().includes(q);
                  })
                  .map((well) => (
                    <button
                      key={well.id}
                      onClick={() => { selectWell(well.id); setShowWellPicker(false); setWellSearch(''); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${selectedWellId === well.id
                        ? 'bg-cyan-50 text-cyan-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            well.riskLevel === 'critical' ? '#ef4444'
                              : well.riskLevel === 'high' ? '#f97316'
                                : well.riskLevel === 'medium' ? '#f59e0b'
                                  : '#22c55e',
                        }}
                      />
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{well.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {well.id} · {well.state ?? 'Assam'} · {well.totalDepth.toLocaleString()}m
                        </span>
                      </div>
                    </button>
                  ))}

                {allWells.filter((w) => {
                  if (!wellSearch.trim()) return true;
                  const q = wellSearch.toLowerCase();
                  return w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
                }).length === 0 && (
                    <p className="px-3 py-3 text-xs text-slate-500 text-center">No wells match your search</p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-2.5 border-t border-slate-200 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-[#ffffff]/95 border-b border-slate-200 backdrop-blur-xl flex-shrink-0 z-20">
          {/* Left section: Active Rig status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
              <span>Active: {activeWell?.rig ?? 'OIL RIG-14'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span>Well:</span>
              <span className="font-semibold text-slate-900">{activeWell?.id ?? 'DLJ-NEW-01'}</span>
              <span className="text-slate-300">·</span>
              <span>Formation:</span>
              <span className="text-emerald-700 font-semibold">{activeWell?.currentFormation ?? 'Barail Group'}</span>
            </div>
          </div>

          {/* Right section: Evaluation guide and action pills */}
          <div className="flex items-center gap-2.5">
            {/* Guide & Presentation button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-cyan-300 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <HelpCircle size={14} className="text-cyan-600" />
              <span className="hidden sm:inline">PS 26121 Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-700">Oil India Limited</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">Upper Assam Basin</span>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-auto bg-[#ffffff]">
          <Outlet />
        </main>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                <Compass size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">eRTMAC-NWIS Evaluation Guide</h2>
                <p className="text-xs text-cyan-700 font-medium">
                  SIH Problem Statement 26121 — Oil India Limited (Upper Assam Basin)
                </p>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
              {[
                { id: 'architecture', label: '1. Architecture & PS 26121' },
                { id: 'tour', label: '2. 2-Min Demo Walkthrough' },
                { id: 'glossary', label: '3. Petroleum Terms Glossary' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setGuideTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${guideTab === t.id
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Content */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {guideTab === 'architecture' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    eRTMAC-NWIS is an intelligent decision-support system designed for drilling operations. It continuously correlates the active drilling well with historical offset well records in the Upper Assam basin to predict subsurface hazards before they happen.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 flex-shrink-0">
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">1. Predictive Hazard Alerts</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                          Matches the current bit depth against nearby historical incidents (Kicks, Stuck Pipe, Mud Losses) within a ±150 m depth window to provide immediate mitigation advice.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 flex-shrink-0">
                        <Crosshair size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">2. Geospatial Proximity Intelligence</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                          Interactive map plotting 18 offset wells with customizable radius filtering (5 km to 50 km), clean Esri basemaps, and direct correlation vector rays.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                        <Database size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">3. NLP Knowledge Search & Ingestion</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                          Instant semantic retrieval across Daily Drilling Reports (DDR) and Well Completion Reports (WCR), with automated entity extraction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {guideTab === 'tour' && (
                <div className="space-y-3 text-xs text-slate-700">
                  <p className="text-cyan-800 font-semibold mb-2">
                    Follow these 6 steps to demonstrate the complete capability to any evaluator:
                  </p>
                  {[
                    { step: 'Step 1', title: 'Dashboard Telemetry & Depth Simulator', action: 'Go to Dashboard. Click "2100m Barail Kick" or "3120m Kopili Stuck". Notice how live telemetry, hazards, and mud weights dynamically react.' },
                    { step: 'Step 2', title: 'Geospatial Map & Correlation Rays', action: 'Go to Map. Toggle between Satellite, Dark, and Topo basemaps. Notice the dashed correlation vectors linking DLJ-NEW-01 to historical offset wells.' },
                    { step: 'Step 3', title: 'Predictive Hazard Mitigation', action: 'Go to Predictive Alerts. Check the recommended mitigation. Click "Acknowledge" to log supervisor sign-off, or "Copy Rig Handover Briefing".' },
                    { step: 'Step 4', title: 'Knowledge Base Semantic Search', action: 'Go to Knowledge Search. Click suggested chips like "Barail Mud Loss" or "Differential Sticking" to view instant excerpt matches.' },
                    { step: 'Step 5', title: 'Cross-Well Stratigraphic Correlation', action: 'Go to Correlation. Compare DLJ-NEW-01 with NHK-01 to overlay ROP and mud weight curves across formations.' },
                    { step: 'Step 6', title: 'Automated DDR / WCR Ingestion', action: 'Go to Doc Ingest. Click any of the 3 preloaded sample reports and run AI Extraction to see the OCR & NLP pipeline.' },
                  ].map((s) => (
                    <div key={s.step} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex gap-3">
                      <span className="text-cyan-700 font-bold font-mono whitespace-nowrap">{s.step}:</span>
                      <div>
                        <strong className="text-slate-900 block mb-0.5">{s.title}</strong>
                        <span className="text-slate-600 leading-relaxed">{s.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {guideTab === 'glossary' && (
                <div className="space-y-2.5 text-xs">
                  <p className="text-cyan-800 font-semibold mb-2">
                    Key Petroleum & Drilling Terms Explained:
                  </p>
                  {[
                    { term: 'ROP (Rate of Penetration)', def: 'Speed at which the drill bit cuts through formation (meters/hour). Sudden spike indicates a drilling break or high-porosity kick zone.' },
                    { term: 'WOB (Weight on Bit)', def: 'Downward mechanical load applied to the drill bit (kilonewtons). Controlled to prevent bit deviation or drillstring buckling.' },
                    { term: 'Mud Weight (SG)', def: 'Specific gravity of the drilling fluid. Balances formation pore pressure to keep oil/gas from kicking into the wellbore.' },
                    { term: 'Kick / Gas Influx', def: 'Uncontrolled flow of reservoir gas/oil into the wellbore when hydrostatic mud pressure falls below formation pressure.' },
                    { term: 'Differential Sticking', def: 'Condition where the drillstring is pinned against a permeable mud cake due to overbalanced hydrostatic pressure.' },
                    { term: 'LCM (Lost Circulation Material)', def: 'Granular additives (mica, graphite, calcium carbonate) pumped into the well to bridge and seal fractured thief zones.' },
                    { term: 'NPT (Non-Productive Time)', def: 'Unplanned rig stoppage hours caused by equipment failure, stuck pipe, kicks, or mud losses.' },
                  ].map((g) => (
                    <div key={g.term} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-amber-700 font-bold mb-0.5">{g.term}</p>
                      <p className="text-slate-700 leading-normal">{g.def}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center gap-3 pt-3 mt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Oil India Limited · eRTMAC-NWIS Hackathon Prototype
              </span>
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/20"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
