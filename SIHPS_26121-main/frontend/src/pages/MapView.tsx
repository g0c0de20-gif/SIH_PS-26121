import React, { useEffect, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Circle,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Layers,
  Search,
  Crosshair,
  Compass,
  RotateCcw,
  Activity,
  AlertTriangle,
  X,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Navigation,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { fetchNearbyWells, fetchAllWells } from '../api';
import type { Well } from '../types';
import {
  MAP_ZOOM,
  RISK_MARKER_COLORS,
  formatDepth,
  getSeverityClass,
  EVENT_TYPE_ICONS,
} from '../utils/constants';
import { useActiveWell } from '../context/ActiveWellContext';

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function MapController({
  center,
  zoom,
}: {
  center: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const TILE_LAYERS = [
  {
    id: 'dark',
    label: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  {
    id: 'satellite',
    label: 'Satellite Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Earthstar Geographics',
  },
  {
    id: 'osm',
    label: 'Street Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  },
];

export default function MapView() {
  const { activeWell, activeWellLat, activeWellLng, selectedWellId, selectWell, allWells: contextWells } = useActiveWell();
  const [radius, setRadius] = useState(25);
  const [showAll, setShowAll] = useState(false);
  const [wells, setWells] = useState<Well[]>([]);
  const [everyWell, setEveryWell] = useState<Well[]>([]);
  const [selectedTile, setSelectedTile] = useState(0);
  const [selectedWell, setSelectedWell] = useState<Well | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high'>('all');
  const [showVectors, setShowVectors] = useState(true);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  const [focusZoom, setFocusZoom] = useState<number>(11);
  const [loading, setLoading] = useState(true);

  const loadWells = useCallback(async (r: number) => {
    const data = await fetchNearbyWells(activeWellLat, activeWellLng, r);
    setWells(data);
  }, [activeWellLat, activeWellLng]);

  // Load all wells (no radius filter) for the "All" option
  useEffect(() => {
    fetchAllWells().then((all) => {
      setEveryWell(all);
      setLoading(false);
    });
    if (!showAll) {
      loadWells(radius);
    }
  }, [loadWells, radius, selectedWellId, showAll]);

  // The wells to display on the map: either radius-filtered or all
  const displayWells = showAll ? everyWell : wells;

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    loadWells(newRadius);
  };

  const resetView = () => {
    setFocusTarget([activeWellLat, activeWellLng]);
    setFocusZoom(11);
    setSelectedWell(null);
  };

  const filteredWells = displayWells.filter((w) => {
    // Don't show the currently active well as an offset marker
    if (w.id === selectedWellId) return false;
    if (searchQuery) {
      const match =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.state && w.state.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }
    if (riskFilter === 'high') {
      return w.riskLevel === 'high' || w.riskLevel === 'critical';
    }
    return true;
  });

  const tile = TILE_LAYERS[selectedTile];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#ffffff]">
      {/* Top Floating Control Capsule */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between flex-wrap gap-3 pointer-events-none">
        {/* Left capsule: Search & Filters */}
        <div className="flex items-center gap-2.5 pointer-events-auto bg-[#ffffff]/90 backdrop-blur-xl border border-slate-700/80 p-2 rounded-2xl shadow-2xl">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 w-44 sm:w-56 focus-within:border-cyan-500">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search offset wells…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Risk Toggle */}
          <button
            onClick={() => setRiskFilter(riskFilter === 'all' ? 'high' : 'all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${riskFilter === 'high'
              ? 'bg-rose-500/20 text-black-300 border-rose-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-black'
              }`}
          >
            {riskFilter === 'high' ? '⚠️ High Risk Only' : 'All Risk Levels'}
          </button>

          {/* Vectors Toggle */}
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${showVectors
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
          >
            <Radio size={12} />
            <span>Vectors</span>
          </button>
        </div>

        {/* Center/Right capsule: Radius & Map Layers */}
        <div className="flex items-center gap-2.5 pointer-events-auto bg-[#ffffff]/90 backdrop-blur-xl border border-slate-700/80 p-2 rounded-2xl shadow-2xl">
          {/* Radius Presets */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2">Radius:</span>
            {[15, 25, 50, 100].map((r) => (
              <button
                key={r}
                onClick={() => { setShowAll(false); handleRadiusChange(r); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${!showAll && radius === r
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {r}km
              </button>
            ))}
            <button
              onClick={() => setShowAll(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${showAll
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              All
            </button>
          </div>

          {/* Layer switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <Layers size={13} className="text-slate-400" />
            <select
              value={selectedTile}
              onChange={(e) => setSelectedTile(Number(e.target.value))}
              className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
            >
              {TILE_LAYERS.map((tl, i) => (
                <option key={tl.id} value={i} className="bg-slate-900 text-slate-200">
                  {tl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recenter button */}
          <button
            onClick={resetView}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Recenter on Active Rig"
          >
            <Crosshair size={15} />
          </button>
        </div>
      </div>

      {/* Floating Bottom Left: Risk Legend & Stats */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto bg-[#ffffff]/90 backdrop-blur-xl border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl max-w-xs space-y-2">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <span className="text-slate-400 font-medium">
            {showAll ? 'All Wells:' : 'Offset Proximity:'}
          </span>
          <span className="text-cyan-400 font-bold font-mono">
            {filteredWells.length} wells{!showAll ? ` in ${radius} km` : ''}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 pb-1.5 border-b border-slate-800">
          Active: <span className="text-cyan-300 font-semibold">{activeWell?.name ?? 'DLJ-NEW-01'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse" />
            <span className="font-semibold text-white">Active Rig</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Low Risk</span>
          </div>
        </div>
      </div>

      {/* Floating Selected Well Inspector Sheet (Right Side) */}
      {selectedWell && (
        <div className="absolute top-20 right-6 z-20 pointer-events-auto w-84 bg-[#ffffff]/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl animate-slide-up space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: RISK_MARKER_COLORS[selectedWell.riskLevel] }}
              />
              <div>
                <h3 className="font-bold text-white text-sm">{selectedWell.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedWell.id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedWell(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Distance to Rig</span>
              <span className="font-bold text-amber-400 font-mono">
                {haversineDist(activeWellLat, activeWellLng, selectedWell.lat, selectedWell.lng)} km
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Risk Level</span>
              <span className={getSeverityClass(selectedWell.riskLevel)}>{selectedWell.riskLevel}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Total Depth</span>
              <span className="font-mono text-slate-200">{formatDepth(selectedWell.totalDepth)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Well Type</span>
              <span className="text-slate-200">{selectedWell.wellType}</span>
            </div>
          </div>

          {selectedWell.worstEvent && (
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase mb-0.5">
                Worst Historical Incident:
              </span>
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <span>{EVENT_TYPE_ICONS[selectedWell.worstEvent] || '⚠️'}</span>
                <span>{selectedWell.worstEvent}</span>
              </span>
            </div>
          )}

          {/* Set as Active Well button */}
          <button
            onClick={() => {
              selectWell(selectedWell.id);
              setSelectedWell(null);
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedWellId === selectedWell.id
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02]'
              }`}
          >
            {selectedWellId === selectedWell.id ? (
              <><Crosshair size={14} /> Currently Active Well</>
            ) : (
              <><Navigation size={14} /> Set as Active Well</>
            )}
          </button>

          <Link
            to={`/wells/${selectedWell.id}`}
            className="btn-secondary w-full justify-center py-2 text-xs font-bold"
          >
            <span>View Full Well Record</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Main Map */}
      <MapContainer
        center={[activeWellLat, activeWellLng]}
        zoom={MAP_ZOOM}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={focusTarget} zoom={focusZoom} />
        <TileLayer url={tile.url} attribution={tile.attribution} />

        {/* Proximity Radius Circle around Active Rig */}
        {!showAll && (
          <Circle
            center={[activeWellLat, activeWellLng]}
            radius={radius * 1000}
            pathOptions={{
              color: '#06B6D4',
              weight: 1.5,
              dashArray: '5, 5',
              fillColor: '#06B6D4',
              fillOpacity: 0.05,
            }}
          />
        )}

        {/* Correlation Vector Rays */}
        {showVectors &&
          filteredWells.map((w) => (
            <Polyline
              key={`vec-${w.id}`}
              positions={[
                [activeWellLat, activeWellLng],
                [w.lat, w.lng],
              ]}
              pathOptions={{
                color: RISK_MARKER_COLORS[w.riskLevel] || '#38BDF8',
                weight: 1.2,
                dashArray: '3, 6',
                opacity: 0.45,
              }}
            />
          ))}

        {/* Active Well / Rig Marker */}
        <CircleMarker
          center={[activeWellLat, activeWellLng]}
          radius={11}
          pathOptions={{
            color: '#06B6D4',
            weight: 3,
            fillColor: '#22D3EE',
            fillOpacity: 0.95,
          }}
          className="active-well-marker"
        >
          <Tooltip direction="top" offset={[0, -10]} permanent>
            <span className="font-bold text-cyan-300">{activeWell?.rig ?? 'OIL RIG-14'} ({activeWell?.id ?? 'DLJ-NEW-01'})</span>
          </Tooltip>
          <Popup>
            <div className="p-2 space-y-1.5 text-xs">
              <span className="font-bold text-white block text-sm">Active: {activeWell?.rig ?? 'OIL RIG-14'}</span>
              <p className="text-slate-300">Well: {activeWell?.name ?? 'DLJ-NEW-01'} · Upper Assam</p>
              <p className="text-cyan-400 font-mono">Current Depth: {formatDepth(activeWell?.currentDepth ?? 2100)}</p>
            </div>
          </Popup>
        </CircleMarker>

        {/* Offset Well Markers */}
        {filteredWells.map((well) => (
          <CircleMarker
            key={well.id}
            center={[well.lat, well.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: RISK_MARKER_COLORS[well.riskLevel] || '#22C55E',
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => {
                setSelectedWell(well);
                setFocusTarget([well.lat, well.lng]);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-semibold text-slate-100">{well.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
