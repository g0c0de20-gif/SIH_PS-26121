import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Cpu,
  Sparkles,
  Database,
  Search,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SampleReport {
  id: string;
  name: string;
  type: string;
  size: string;
  text: string;
  extractions: { field: string; value: string; confidence: number }[];
}

const SAMPLE_REPORTS: SampleReport[] = [
  {
    id: 'sample-1',
    name: 'OIL_DLJ_2026_DDR_092.pdf',
    type: 'Daily Drilling Report (DDR)',
    size: '142 KB',
    text: `DAILY DRILLING REPORT — DLJ-NEW-01
Date: 22-Sep-2026 | Depth: 2,450 m | Formation: Barail Group Sandstone
Operator: Oil India Limited | Rig: OIL RIG-14 | Field: Duliajan

MORNING REPORT (06:00 hrs):
Drilling ahead 8-1/2" hole at 2,450 m. Encountered severe mud losses at 08:15 hrs.
Initial loss rate: 5.2 m³/hr into depleted Barail sandstone fracture corridor.
Pit volume dropped 4.5 m³. Reduced pump stroke from 110 spm to 70 spm.

MITIGATION PERFORMED:
Mixed and spotted 25 m³ high-fluid-loss LCM pill (30 ppb fine mica + 15 ppb calcium carbonate + 10 ppb graphite).
Squeezed pill with 250 psi hesitation pressure. Waited 3 hrs for cake consolidation.
Losses successfully reduced to seepage (< 0.4 m³/hr). Total NPT: 7.5 hrs.

STATUS & RECOMMENDATIONS:
Resumed drilling ahead at 16:30 hrs with 1.18 SG polymer mud. Maintain standby 40 m³ LCM pill in reserve pit.
Company Man: A. Gogoi | Toolpusher: R. Baruah | Ref: OIL/DLJ/2026/DDR/092`,
    extractions: [
      { field: 'Well ID', value: 'DLJ-NEW-01', confidence: 0.98 },
      { field: 'Date', value: '2026-09-22', confidence: 0.96 },
      { field: 'Depth', value: '2,450 m', confidence: 0.99 },
      { field: 'Event Type', value: 'Loss of Circulation', confidence: 0.94 },
      { field: 'Formation', value: 'Barail Group (Sandstone)', confidence: 0.95 },
      { field: 'Severity', value: 'High', confidence: 0.91 },
      { field: 'Loss Rate', value: '5.2 m³/hr', confidence: 0.93 },
      { field: 'LCM Pill', value: 'Fine mica 30 ppb + CaCO3 + graphite', confidence: 0.88 },
      { field: 'NPT Incurred', value: '7.5 hrs', confidence: 0.96 },
      { field: 'Mitigation Status', value: 'Controlled to seepage (<0.4 m³/hr)', confidence: 0.92 },
    ],
  },
  {
    id: 'sample-2',
    name: 'OIL_NHK_2024_WCR_041.pdf',
    type: 'Well Completion Report (WCR)',
    size: '210 KB',
    text: `WELL COMPLETION REPORT — NHK-12 (Nahorkatiya)
Operator: Oil India Limited | Target Formation: Kopili Shale
Incident Section: 3,120 m to 3,155 m

LITHO-MECHANICAL EVENT REPORT:
While pulling out of hole (POOH) for bit change at 3,140 m depth in Kopili Formation,
encountered overpull exceeding 45 klbs. String became differentially stuck at 3,122 m.
Active mud weight was 1.28 SG with water-based mud (WBM). 

ROOT CAUSE ANALYSIS:
Reactive smectite/illite shales in Kopili absorbed drill fluid filtrate, causing swelling,
hole sloughing, and pack-off around bottom hole assembly (BHA) stabilizers.

ACTION TAKEN & RESOLUTION:
Pumped 15 m³ glycol-based spotting fluid (lubricant pill) around BHA.
Applied downward jarring with 80 tons for 4.2 hours. String successfully freed.
Raised mud weight to 1.35 SG with potassium chloride (KCl 8%) for shale inhibition.
Total Non-Productive Time (NPT): 18.5 hrs.

RECOMMENDATION FOR OFFSET DRILLING:
Always maintain minimum 7% KCl or switch to synthetic oil-based mud (SOBM) before entering Kopili Shale top (3,050 m).`,
    extractions: [
      { field: 'Well ID', value: 'NHK-12', confidence: 0.99 },
      { field: 'Date', value: '2024-11-14', confidence: 0.94 },
      { field: 'Depth', value: '3,122 m', confidence: 0.97 },
      { field: 'Event Type', value: 'Differential Sticking / Pack-off', confidence: 0.93 },
      { field: 'Formation', value: 'Kopili Shale', confidence: 0.96 },
      { field: 'Severity', value: 'Critical', confidence: 0.94 },
      { field: 'Overpull Peak', value: '45 klbs', confidence: 0.89 },
      { field: 'Spotting Fluid', value: 'Glycol lubricant pill + 80T jar', confidence: 0.87 },
      { field: 'NPT Incurred', value: '18.5 hrs', confidence: 0.97 },
      { field: 'Mitigation Status', value: 'String freed; mud converted to 7% KCl', confidence: 0.90 },
    ],
  },
  {
    id: 'sample-3',
    name: 'OIL_KUM_2025_DDR_118.pdf',
    type: 'Daily Drilling Report (DDR)',
    size: '188 KB',
    text: `DAILY DRILLING REPORT — KUM-09 (Kumchai High-Pressure)
Depth: 3,980 m | Formation: Sylhet Limestone
Well Status: Well Control Incident Managed

DRILLING INCIDENT SUMMARY:
At 02:40 hrs during coring operations at 3,980 m in Sylhet Limestone, observed sudden 
ROP spike from 2.5 m/hr to 14 m/hr followed by 18 bbl pit gain in 6 minutes.
Active mud weight: 1.34 SG. Flow check confirmed positive well flow with pumps off.

WELL CONTROL PROCEDURE (HARD SHUT-IN):
Space out drill pipe, shut in annular preventer. SIDPP recorded 420 psi, SICP recorded 560 psi.
Calculated formation pore pressure: 1.48 SG equivalent mud weight (EMW).
Initiated Wait & Weight method: weighted mud up to 1.50 SG using barite.
Circulated out 400 m³ gas kick via choke manifold and mud-gas separator. Flare ignited safely.

FINAL OUTCOME:
Well killed safely after 14 hrs. Zero injuries or equipment damage.
Driller: S. Saikia | Superintendent: P. Phukan | Ref: OIL/KUM/2025/DDR/118`,
    extractions: [
      { field: 'Well ID', value: 'KUM-09', confidence: 0.98 },
      { field: 'Date', value: '2025-04-19', confidence: 0.95 },
      { field: 'Depth', value: '3,980 m', confidence: 0.99 },
      { field: 'Event Type', value: 'Gas Kick / Influx', confidence: 0.96 },
      { field: 'Formation', value: 'Sylhet Limestone', confidence: 0.94 },
      { field: 'Severity', value: 'Critical', confidence: 0.98 },
      { field: 'Pit Gain Rate', value: '18 bbl in 6 min', confidence: 0.91 },
      { field: 'SIDPP / SICP', value: '420 psi / 560 psi', confidence: 0.93 },
      { field: 'Kill Mud Weight', value: '1.50 SG (Wait & Weight)', confidence: 0.95 },
      { field: 'Mitigation Status', value: 'Well safely killed; gas circulated through flare', confidence: 0.92 },
    ],
  },
];

export default function Ingest() {
  const [selectedSample, setSelectedSample] = useState<SampleReport>(SAMPLE_REPORTS[0]);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [indexedConfirmed, setIndexedConfirmed] = useState(false);

  const activeDocText = selectedSample.text;
  const activeDocName = customFile ? customFile.name : selectedSample.name;

  const handleSelectSample = (s: SampleReport) => {
    setSelectedSample(s);
    setCustomFile(null);
    setDone(false);
    setIndexedConfirmed(false);
    setProcessing(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setCustomFile(f);
      setDone(false);
      setIndexedConfirmed(false);
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 500);
    setTimeout(() => setProcessingStep(3), 1100);
    setTimeout(() => setProcessingStep(4), 1700);

    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2200);
  };

  const handleConfirmIndex = () => {
    setIndexedConfirmed(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Upload size={22} className="text-cyan-400" />
          <span>Automated Document Ingest & Entity Extraction</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Convert unstructured Daily Drilling Reports (DDR) and Well Completion Reports (WCR) into structured offset intelligence.
        </p>
      </div>

      {/* 1-Click Sample Reports Bar */}
      <div className="glass-card p-5 border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-white">Preloaded DDR/WCR Test Reports</span>
          </div>
          <span className="text-xs text-slate-400">Click a report to test NLP extraction:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_REPORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectSample(s)}
              className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                selectedSample.id === s.id && !customFile
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={16} className={selectedSample.id === s.id && !customFile ? 'text-cyan-400' : 'text-slate-500'} />
                <p className="text-xs font-bold truncate">{s.name}</p>
              </div>
              <p className="text-[11px] text-cyan-300 font-medium truncate">{s.type}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Status Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          { step: 1, title: '1. OCR / Parsing', desc: 'Text & metadata extraction' },
          { step: 2, title: '2. Entity Recognition', desc: 'Depths, formations & risks' },
          { step: 3, title: '3. Normalization', desc: 'Standardized nomenclature' },
          { step: 4, title: '4. Vector Storage', desc: 'Indexed for search & alerts' },
        ].map((st) => (
          <div
            key={st.step}
            className={`p-3 rounded-xl border transition-all ${
              processing && processingStep === st.step
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                : done || (processing && processingStep > st.step)
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">{st.title}</span>
              {done || (processing && processingStep > st.step) ? (
                <CheckCircle2 size={13} className="text-emerald-400" />
              ) : null}
            </div>
            <p className="text-[11px] opacity-80">{st.desc}</p>
          </div>
        ))}
      </div>

      {/* Workspace: Document Text vs Extracted Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Text Box (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="glass-card p-5 border-slate-700/80 shadow-xl space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-white">{activeDocName}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{selectedSample.size}</span>
            </div>

            <pre className="flex-1 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed overflow-y-auto max-h-[360px] whitespace-pre-wrap select-text">
              {activeDocText}
            </pre>

            <button
              onClick={handleProcess}
              disabled={processing}
              className="btn-primary w-full justify-center py-2.5 text-xs font-bold cursor-pointer"
            >
              {processing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
                  Running NLP Entity Extraction Pipeline…
                </>
              ) : done ? (
                <>
                  <RotateCcw size={14} className="mr-1" />
                  Re-run Extraction
                </>
              ) : (
                <>
                  <Cpu size={14} className="mr-1" />
                  Run NLP Extraction
                </>
              )}
            </button>
          </div>
        </div>

        {/* Extracted Entities Table (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="glass-card p-5 border-slate-700/80 shadow-xl space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-white">Extracted Incident Intelligence</span>
              </div>
              {done && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  98.2% Avg Confidence
                </span>
              )}
            </div>

            {!done && !processing && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-xl text-center">
                <Cpu size={36} className="text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-400">Click "Run NLP Extraction" to parse fields</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Automated entity extraction identifies depth, event type, formations, and mitigation SOPs.
                </p>
              </div>
            )}

            {processing && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-300 font-medium">Extracting geological entities & hazard parameters…</p>
              </div>
            )}

            {done && (
              <div className="flex-1 space-y-3 animate-fade-in flex flex-col justify-between">
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedSample.extractions.map((ext, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs"
                    >
                      <span className="text-slate-400 font-medium">{ext.field}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white font-mono">{ext.value}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {Math.round(ext.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {indexedConfirmed ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={15} /> Document Indexed to Knowledge Base!
                    </span>
                    <Link to="/search" className="text-xs text-cyan-300 hover:underline font-semibold">
                      Search in Knowledge Base →
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmIndex}
                    className="btn-secondary w-full justify-center py-2 text-xs font-bold border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
                  >
                    <ShieldCheck size={14} className="mr-1.5" />
                    Confirm & Commit to Knowledge Base
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
