// Shared TypeScript types for eRTMAC-NWIS

export interface Well {
  id: string;
  name: string;
  lat: number;
  lng: number;
  spudDate: string;
  totalDepth: number;
  status: string;
  operator: string;
  wellType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  worstEvent: string;
  remarks: string;
  distanceKm?: number;
  state?: string;
  district?: string;
}

export interface Formation {
  id: string;
  name: string;
  topDepth: number;
  baseDepth: number;
  lithology: string;
  color: string;
}

export interface WellEvent {
  id: string;
  date: string;
  depth: number;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  formation: string;
  remark: string;
  mitigation: string;
  wellId?: string;
  wellName?: string;
  distanceKm?: number;
  depthDelta?: number;
}

export interface CasingString {
  size: string;
  depth: number;
  type: string;
  weight: string;
  grade: string;
  cementTOC: string;
}

export interface CasingInfo {
  casingProgram: CasingString[];
  cementingSummary: string;
  completionZone: string;
  wellResult: string;
}

export interface WellProfile extends Well {
  formations: Formation[];
  events: WellEvent[];
  casingInfo: CasingInfo | null;
}

export interface KnowledgeSnippet {
  id: string;
  wellId: string;
  depth: number;
  formation: string;
  eventType: string;
  severity: string;
  text: string;
  date: string;
  source: string;
}

export interface DrillingParam {
  depth: number;
  rop: number;
  mudWeight: number;
  torque: number;
  wob: number;
}

export interface ActiveWell {
  id: string;
  name: string;
  lat: number;
  lng: number;
  spudDate: string;
  plannedTD: number;
  currentDepth: number;
  daysOnWell: number;
  operator: string;
  wellType: string;
  rig: string;
  mudType: string;
  mudWeight: number;
  rop: number;
  wob: number;
  torque: number;
  rpm: number;
  sppa: number;
  currentFormation: string;
  casingProgram: { size: string; depth: number; type: string }[];
  trajectory: { md: number; tvd: number; displacement: number }[];
}

export interface Alert {
  id: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedWells: string[];
  affectedWellCount: number;
  depthRange: { min: number; max: number };
  formations: string[];
  currentDepth: number;
  message: string;
  mitigation: string;
  events: WellEvent[];
}

export interface AlertsResponse {
  alerts: Alert[];
  summary: string;
  currentDepth: number;
  radius: number;
  nearbyWellsChecked: number;
}

export type EventType = 'Kick' | 'Mud Loss' | 'Stuck Pipe' | 'Torque Spike' | 'NPT' | 'Cementing Issue';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
