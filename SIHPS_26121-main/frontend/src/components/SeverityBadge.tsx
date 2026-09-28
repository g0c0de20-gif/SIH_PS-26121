import React from 'react';
import { getSeverityClass } from '../utils/constants';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export default function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  return (
    <span className={`${getSeverityClass(severity)} ${className}`}>
      {severity}
    </span>
  );
}
