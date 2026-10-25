import React from 'react';
import {
  CheckCircle2,
  Radio,
  Route,
  Snowflake,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const DEFAULT_STATUS_ICONS = {
  moving: CheckCircle2,
  signal: Radio,
  corridor: Route,
  'cold-chain': Snowflake,
  idle: Clock,
  critical: AlertTriangle,
};

/**
 * نشانگر وضعیت غیررنگی (StatusChip)
 * هر وضعیت علاوه بر رنگ، آیکن متمایز و برچسب متنی فارسی دارد تا برای کاربران کوررنگ کاملاً قابل تشخیص باشد.
 */
export function StatusChip({
  status = 'moving',
  label,
  icon,
  className = '',
}) {
  const IconComp = icon || DEFAULT_STATUS_ICONS[status] || CheckCircle2;

  return (
    <span className={`ds-status-chip ${className}`.trim()} data-status={status}>
      <IconComp size={13} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default StatusChip;
