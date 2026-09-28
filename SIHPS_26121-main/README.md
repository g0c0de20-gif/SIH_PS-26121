# eRTMAC-NWIS — Nearby Wells Intelligence System

> **AI-Powered Offset Well Decision Support for Oil India Limited**  
> Hackathon Prototype — Upper Assam Basin (Duliajan/Naharkatiya Area)

---

## 🛢️ Overview

eRTMAC-NWIS is a standalone decision-support prototype that surfaces historical knowledge from nearby offset wells (mud losses, kicks, stuck pipe, cementing issues) while drilling a new well. It integrates alongside the existing eRTMAC real-time drilling monitoring system.

**Key Features:**
- 🗺️ **Geospatial Map** — Interactive Leaflet map with 18 offset wells, radius slider, and color-coded risk markers
- 📊 **Well Profiles** — Full DDR event logs, formation columns, casing programs, and drilling parameter trends
- 🔍 **AI Knowledge Search** — Full-text search over 35 extracted report snippets with formation/event filters
- 📈 **Cross-Well Correlation** — Overlaid drilling parameter charts with historical event hazard bands
- ⚠️ **Predictive Alerts** — Rule-based hazard engine fires alerts as depth slider moves through known event zones
- 📄 **Document Ingest** — Mocked OCR/NLP pipeline demonstrating the ingestion concept

---

## 🏗️ Project Structure

```
sih26121/
├── backend/                    # Node.js + Express API server
│   ├── server.js               # Entry point (port 3001)
│   ├── routes/
│   │   ├── wells.js            # Well CRUD + nearby + drilling params
│   │   ├── snippets.js         # Knowledge base search API
│   │   └── alerts.js           # Rule-based alert engine
│   └── db/                     # Static JSON mock database
│       ├── wells.json           # 18 offset wells
│       ├── events.json          # DDR event logs
│       ├── formations.json      # Formation depth ranges
│       ├── casings.json         # Casing programs + cementing
│       ├── snippets.json        # 35 knowledge snippets
│       └── active_well.json     # Active well (DLJ-NEW-01)
│
└── frontend/                   # React 18 + TypeScript + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Dashboard.tsx    # KPIs, alerts feed, navigation
        │   ├── MapView.tsx      # Leaflet map with well markers
        │   ├── WellList.tsx     # Offset well list/grid
        │   ├── WellProfile.tsx  # Full well record
        │   ├── KnowledgeSearch.tsx  # AI search interface
        │   ├── Correlation.tsx  # Cross-well analytics
        │   ├── Alerts.tsx       # Predictive alert panel
        │   └── Ingest.tsx       # Document ingestion (stretch)
        ├── components/
        │   └── Layout.tsx       # Persistent sidebar navigation
        ├── api/index.ts         # API client (axios)
        ├── types/index.ts       # TypeScript types
        └── utils/constants.ts   # Color maps, formatters
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js 18+** (check: `node --version`)
- **npm 9+** (check: `npm --version`)

### Step 1 — Start the Backend

```bash
cd backend
npm install      # Install Express + cors
npm start        # Starts API server on http://localhost:3001
```

> Verify backend is running: http://localhost:3001/api/health

### Step 2 — Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install      # Install React, Leaflet, Recharts, etc.
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### Step 3 — Open the App

Navigate to: **http://localhost:5173**

The app loads instantly with all 18 synthetic offset wells pre-seeded. No manual data entry required.

---

## 🎮 Demo Walkthrough

| Module | What to show |
|--------|-------------|
| **Dashboard** | KPI cards, live parameter sparklines, alert feed |
| **Map** | Drag radius slider (5→50 km), click well markers, toggle base maps |
| **Well Profile** | Select different wells from dropdown, expand event log, view drilling parameter chart |
| **Knowledge Search** | Type "mud loss Barail", filter by formation/event type, expand snippets |
| **Correlation** | Add/remove wells, switch parameters (ROP/MudWeight/Torque), observe event bands |
| **Alerts** | Move depth slider through 900m (Tipam), 2100m (Barail), 3500m (Kopili) — watch alerts fire |
| **Doc Ingest** | Upload any file → click "Run NLP Extraction" → see mocked field extraction |

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/wells` | All 18 offset wells |
| GET | `/api/wells/nearby?lat=27.37&lng=95.32&radius=25` | Wells within radius |
| GET | `/api/wells/:id` | Full well profile (formations, events, casing) |
| GET | `/api/wells/:id/drilling-params` | Synthetic drilling params vs depth |
| GET | `/api/snippets?q=mud+loss&formation=Barail` | Knowledge search |
| GET | `/api/snippets/meta` | Available filter options |
| GET | `/api/active-well` | Active well definition |
| GET | `/api/alerts?depth=2100&radius=25&lat=27.374&lng=95.318` | Rule-based hazard alerts |

---

## 🧠 Alert Engine Architecture

The predictive alert engine (`backend/routes/alerts.js`) is a **rule-based MVP**:

```
RULE: ∀ offset well W within radius R:
      ∀ event E in W.events:
        if |E.depth - currentDepth| ≤ 150m → raise alert
```

**Future ML replacement hook:** Replace the rule with a gradient-boosted classifier (XGBoost/LightGBM) trained on offset-well features: `(depth, formation_encoded, mud_weight, ECD, ROP_trend, inclination, torque_trend)` → `P(event_type | current_state)`. The AlertsResponse JSON contract remains unchanged.

---

## 🗺️ Mock Data

**18 synthetic wells** in Upper Assam Basin near Duliajan (27.37°N, 95.32°E):
- `DLJ-01` through `DLJ-05` — Duliajan cluster
- `NKT-01` through `NKT-04` — Naharkatiya cluster  
- `RDG-01` through `RDG-03` — Rudrasagar cluster
- `HLG-01`, `HLG-02` — Hugrijan cluster
- `LKW-01`, `LKW-02` — Lakwa cluster
- `MKM-01` — Makum
- `DHJ-01` — Dohali

**Formations** (top→down): Girujan Clay → Tipam Sandstone → Barail Group → Kopili Shale → Sylhet Limestone

**Active Well**: `DLJ-NEW-01` at 27.374°N, 95.318°E (currently drilling Barail Group)

---

## ⛽ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Maps | Leaflet.js via react-leaflet |
| Charts | Recharts |
| HTTP client | Axios |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | Static JSON files (mock) |

---

## 📋 Notes for Judges / Evaluators

- **No external APIs** — runs 100% offline once npm packages are installed
- **No authentication** — open access by design for demo purposes
- **Rule-based "AI"** — clearly commented in code with ML upgrade path documented
- **Synthetic data** — all wells, events, and snippets are fictional but realistic for Upper Assam Basin

---

*Built for Smart India Hackathon 2024 | eRTMAC-NWIS Team*
