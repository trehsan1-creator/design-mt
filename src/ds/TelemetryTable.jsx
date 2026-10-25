import React, { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { IranPlate } from './IranPlate.jsx';
import { StatusChip } from './StatusChip.jsx';
import { toFa } from '../utils/faDigits.js';

const DEFAULT_ROWS = [
  {
    id: 'TRK-408',
    plate: { left2: '۴۸', letter: 'ع', mid3: '۷۲۹', iranCode: '۱۱', variant: 'public' },
    corridor: 'تهران ← بندرعباس',
    status: 'moving',
    statusLabel: 'در مسیر مجاز',
    speed: 86,
    fuel: 28.4,
    tempC: 4.2,
    timestamp: '۱۴:۴۲:۱۸',
  },
  {
    id: 'TRK-219',
    plate: { left2: '۶۲', letter: 'ع', mid3: '۳۱۴', iranCode: '۴۳', variant: 'public' },
    corridor: 'اصفهان ← شیراز',
    status: 'cold-chain',
    statusLabel: 'زنجیره سرد پایدار',
    speed: 79,
    fuel: 26.8,
    tempC: -18.4,
    timestamp: '۱۴:۴۱:۵۵',
  },
  {
    id: 'TRK-512',
    plate: { left2: '۲۴', letter: 'د', mid3: '۸۵۱', iranCode: '۶۸', variant: 'private' },
    corridor: 'تبریز ← قزوین',
    status: 'idle',
    statusLabel: 'توقف با موتور روشن',
    speed: 0,
    fuel: 6.2,
    tempC: 11.0,
    timestamp: '۱۴:۴۰:۱۲',
  },
  {
    id: 'TRK-807',
    plate: { left2: '۷۷', letter: 'ع', mid3: '۱۹۵', iranCode: '۱۵', variant: 'public' },
    corridor: 'مشهد ← سمنان',
    status: 'critical',
    statusLabel: 'انحراف از ژئوفنس',
    speed: 104,
    fuel: 34.9,
    tempC: 8.6,
    timestamp: '۱۴:۴۲:۳۱',
  },
  {
    id: 'TRK-634',
    plate: { left2: '۳۹', letter: 'ع', mid3: '۶۴۲', iranCode: '۲۱', variant: 'public' },
    corridor: 'اهواز ← خرم‌آباد',
    status: 'corridor',
    statusLabel: 'عبور از گیت عوارضی',
    speed: 72,
    fuel: 29.1,
    tempC: 6.5,
    timestamp: '۱۴:۳۹:۴۷',
  },
];

const FILTERS = [
  { id: 'all', label: 'همه ناوگان' },
  { id: 'moving', label: 'در حرکت' },
  { id: 'cold-chain', label: 'زنجیره سرد' },
  { id: 'idle', label: 'توقف درجا' },
  { id: 'critical', label: 'هشدار حیاتی' },
];

export function TelemetryTable({ rows = DEFAULT_ROWS, rangeLabel = '۱ تا ۷ آبان ۱۴۰۵' }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState({ key: 'speed', dir: 'desc' });

  const toggleSort = (key) => {
    setSortBy((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
    );
  };

  const visibleRows = useMemo(() => {
    const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);
    return [...filtered].sort((a, b) => {
      const diff = (a[sortBy.key] ?? 0) - (b[sortBy.key] ?? 0);
      return sortBy.dir === 'desc' ? -diff : diff;
    });
  }, [rows, filter, sortBy]);

  const ariaSortFor = (key) => {
    if (sortBy.key !== key) return 'none';
    return sortBy.dir === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="ds-telemetry-block">
      <div className="ds-between-wrap ds-telemetry-block__toolbar">
        <div className="ds-row-wrap" role="group" aria-label="فیلتر وضعیت جدول تله‌متری">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              className={`ds-filter-chip ${filter === f.id ? 'is-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ds-muted ds-tabular">بازه فعال: {rangeLabel}</span>
      </div>

      <div className="ds-table-scroll" role="region" aria-label="جدول تله‌متری زنده خودروها" tabIndex={0}>
        <table className="ds-telemetry-table">
          <thead>
            <tr>
              <th scope="col">پلاک خودرو</th>
              <th scope="col">محور عملیاتی</th>
              <th scope="col">وضعیت تله‌متری</th>
              <th scope="col" aria-sort={ariaSortFor('speed')}>
                <button type="button" className="ds-th-sort" onClick={() => toggleSort('speed')}>
                  <span>سرعت</span>
                  <ArrowUpDown size={13} aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={ariaSortFor('fuel')}>
                <button type="button" className="ds-th-sort" onClick={() => toggleSort('fuel')}>
                  <span>مصرف سوخت</span>
                  <ArrowUpDown size={13} aria-hidden="true" />
                </button>
              </th>
              <th scope="col" aria-sort={ariaSortFor('tempC')}>
                <button type="button" className="ds-th-sort" onClick={() => toggleSort('tempC')}>
                  <span>دمای بار</span>
                  <ArrowUpDown size={13} aria-hidden="true" />
                </button>
              </th>
              <th scope="col">آخرین ثبت</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <IranPlate {...row.plate} size="sm" />
                </td>
                <td className="ds-telemetry-table__corridor">{row.corridor}</td>
                <td>
                  <StatusChip status={row.status} label={row.statusLabel} />
                </td>
                <td className="ds-tabular ds-telemetry-table__num">
                  <strong>{toFa(row.speed)}</strong>
                  <span className="ds-dim"> km/h</span>
                </td>
                <td className="ds-tabular ds-telemetry-table__num">
                  <strong>{toFa(row.fuel.toFixed(1))}</strong>
                  <span className="ds-dim"> L/100</span>
                </td>
                <td className="ds-tabular ds-telemetry-table__num" dir="ltr">
                  <strong>{row.tempC < 0 ? `-${toFa(Math.abs(row.tempC).toFixed(1))}` : `+${toFa(row.tempC.toFixed(1))}`}</strong>
                  <span className="ds-dim"> °C</span>
                </td>
                <td className="ds-tabular ds-muted">{row.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TelemetryTable;
