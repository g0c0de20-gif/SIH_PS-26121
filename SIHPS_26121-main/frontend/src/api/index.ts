import axios from 'axios';
import type {
  Well,
  WellProfile,
  KnowledgeSnippet,
  DrillingParam,
  ActiveWell,
  AlertsResponse,
} from '../types';

const BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Wells
export const fetchAllWells = (): Promise<Well[]> =>
  api.get<Well[]>('/wells').then((r) => r.data);

export const fetchNearbyWells = (
  lat: number,
  lng: number,
  radius: number,
  state?: string
): Promise<Well[]> =>
  api.get<Well[]>('/wells/nearby', { params: { lat, lng, radius, state } }).then((r) => r.data);

export const fetchWellProfile = (id: string): Promise<WellProfile> =>
  api.get<WellProfile>(`/wells/${id}`).then((r) => r.data);

export const fetchDrillingParams = (id: string): Promise<DrillingParam[]> =>
  api.get<DrillingParam[]>(`/wells/${id}/drilling-params`).then((r) => r.data);

// Active well
export const fetchActiveWell = (): Promise<ActiveWell> =>
  api.get<ActiveWell>('/active-well').then((r) => r.data);

// Knowledge snippets
export const fetchSnippets = (params: {
  q?: string;
  formation?: string;
  eventType?: string;
  wellId?: string;
  minDepth?: number;
  maxDepth?: number;
}): Promise<{ total: number; results: KnowledgeSnippet[] }> =>
  api.get('/snippets', { params }).then((r) => r.data);

export const fetchSnippetsMeta = (): Promise<{
  formations: string[];
  eventTypes: string[];
  wellIds: string[];
}> => api.get('/snippets/meta').then((r) => r.data);

// Alerts
export const fetchAlerts = (params: {
  depth: number;
  radius: number;
  lat: number;
  lng: number;
}): Promise<AlertsResponse> =>
  api.get('/alerts', { params }).then((r) => r.data);
