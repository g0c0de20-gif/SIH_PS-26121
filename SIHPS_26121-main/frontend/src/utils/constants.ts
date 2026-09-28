import type { SeverityLevel } from '../types';

export const THEME_PALETTE = {
  indigo: '#1E293B',     // Slate Navy
  cornflower: '#06B6D4', // Electric Cyan
  periwinkle: '#38BDF8', // Sky Blue
  platinum: '#F8FAFC',   // Ultra White
  orange: '#F59E0B',     // Warm Amber
} as const;

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export const SEVERITY_BADGE_CLASS: Record<SeverityLevel, string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  'Kick': '#ef4444',
  'Mud Loss': '#f97316',
  'Stuck Pipe': '#a855f7',
  'Torque Spike': '#3b82f6',
  'NPT': '#6b7280',
  'Cementing Issue': '#eab308',
};

export const EVENT_TYPE_ICONS: Record<string, string> = {
  'Kick': '💥',
  'Mud Loss': '🌊',
  'Stuck Pipe': '⚙️',
  'Torque Spike': '🌀',
  'NPT': '⏱️',
  'Cementing Issue': '🏗️',
};

export const FORMATION_COLORS: Record<string, string> = {
  'Girujan Clay': '#6B7280',
  'Tipam Sandstone': '#D97706',
  'Barail Group': '#059669',
  'Kopili Shale': '#7C3AED',
  'Sylhet Limestone': '#0284C7',
};

export const ACTIVE_WELL_LAT = 27.374;
export const ACTIVE_WELL_LNG = 95.318;
export const MAP_CENTER: [number, number] = [27.374, 95.318];
export const MAP_ZOOM = 11;

export const RISK_MARKER_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export function formatDepth(d: number) {
  return `${d.toLocaleString()} m`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getSeverityClass(severity: string) {
  return SEVERITY_BADGE_CLASS[severity as SeverityLevel] ?? 'badge-info';
}

export function getSeverityColor(severity: string) {
  return SEVERITY_COLORS[severity as SeverityLevel] ?? '#6b7280';
}
