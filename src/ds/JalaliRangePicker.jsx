import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toFa } from '../utils/faDigits.js';

const JALALI_MONTHS = [
  { name: 'فروردین', days: 31, startWeekday: 0 },
  { name: 'اردیبهشت', days: 31, startWeekday: 3 },
  { name: 'خرداد', days: 31, startWeekday: 6 },
  { name: 'تیر', days: 31, startWeekday: 2 },
  { name: 'مرداد', days: 31, startWeekday: 5 },
  { name: 'شهریور', days: 31, startWeekday: 1 },
  { name: 'مهر', days: 30, startWeekday: 4 },
  { name: 'آبان', days: 30, startWeekday: 6 },
  { name: 'آذر', days: 30, startWeekday: 1 },
  { name: 'دی', days: 30, startWeekday: 3 },
  { name: 'بهمن', days: 30, startWeekday: 5 },
  { name: 'اسفند', days: 29, startWeekday: 0 },
];

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function JalaliRangePicker({
  year = 1405,
  initialMonth = 7, // آبان ۱۴۰۵
  initialStart = 1,
  initialEnd = 7,
  onChange,
}) {
  const [monthIdx, setMonthIdx] = useState(initialMonth);
  const [range, setRange] = useState({ start: initialStart, end: initialEnd, pickingEnd: false });

  const month = JALALI_MONTHS[monthIdx];

  const emitChange = (nextMonthIdx, nextStart, nextEnd) => {
    const m = JALALI_MONTHS[nextMonthIdx];
    const formatted = `${toFa(nextStart)} تا ${toFa(nextEnd)} ${m.name} ${toFa(year)}`;
    if (onChange) {
      onChange({
        year,
        monthIndex: nextMonthIdx,
        monthName: m.name,
        startDay: nextStart,
        endDay: nextEnd,
        dayCount: nextEnd - nextStart + 1,
        formatted,
      });
    }
  };

  const handleDayClick = (day) => {
    if (!range.pickingEnd || day < range.start) {
      setRange({ start: day, end: day, pickingEnd: true });
      emitChange(monthIdx, day, day);
    } else {
      setRange({ start: range.start, end: day, pickingEnd: false });
      emitChange(monthIdx, range.start, day);
    }
  };

  const applyPreset = (start, end) => {
    const clampedEnd = Math.min(end, month.days);
    setRange({ start, end: clampedEnd, pickingEnd: false });
    emitChange(monthIdx, start, clampedEnd);
  };

  const stepMonth = (delta) => {
    const next = (monthIdx + delta + 12) % 12;
    const nextMax = JALALI_MONTHS[next].days;
    const s = Math.min(range.start, nextMax);
    const e = Math.min(range.end, nextMax);
    setMonthIdx(next);
    setRange({ start: s, end: e, pickingEnd: false });
    emitChange(next, s, e);
  };

  const blanks = Array.from({ length: month.startWeekday }, (_, i) => i);
  const days = Array.from({ length: month.days }, (_, i) => i + 1);

  return (
    <div className="ds-jalali" role="group" aria-label="انتخابگر بازه تاریخ شمسی">
      <div className="ds-jalali__head">
        <div className="ds-row-sm">
          <Calendar size={16} className="ds-accent-text" aria-hidden="true" />
          <strong className="ds-tabular">
            {toFa(range.start)} تا {toFa(range.end)} {month.name} {toFa(year)}
          </strong>
        </div>
        <span className="ds-jalali__count ds-tabular">
          {toFa(range.end - range.start + 1)} روز کاری
        </span>
      </div>

      <div className="ds-jalali__presets" role="group" aria-label="بازه‌های آماده">
        <button
          type="button"
          className={`ds-jalali__preset ${range.start === 3 && range.end === 3 ? 'is-active' : ''}`}
          onClick={() => applyPreset(3, 3)}
        >
          شیفت امروز
        </button>
        <button
          type="button"
          className={`ds-jalali__preset ${range.start === 1 && range.end === 7 ? 'is-active' : ''}`}
          onClick={() => applyPreset(1, 7)}
        >
          {toFa(7)} روز اخیر
        </button>
        <button
          type="button"
          className={`ds-jalali__preset ${range.start === 1 && range.end === month.days ? 'is-active' : ''}`}
          onClick={() => applyPreset(1, month.days)}
        >
          کل ماه جاری
        </button>
      </div>

      <div className="ds-jalali__nav">
        <button
          type="button"
          className="ds-jalali__nav-btn"
          aria-label="ماه قبل"
          onClick={() => stepMonth(-1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <span className="ds-jalali__month ds-tabular">
          {month.name} {toFa(year)}
        </span>
        <button
          type="button"
          className="ds-jalali__nav-btn"
          aria-label="ماه بعد"
          onClick={() => stepMonth(1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="ds-jalali__weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <span key={w} className="ds-jalali__weekday">{w}</span>
        ))}
      </div>

      <div className="ds-jalali__grid">
        {blanks.map((b) => (
          <span key={`blank-${b}`} className="ds-jalali__blank" aria-hidden="true" />
        ))}
        {days.map((d) => {
          const isEdge = d === range.start || d === range.end;
          const inSpan = d > range.start && d < range.end;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={isEdge || inSpan}
              aria-label={`${toFa(d)} ${month.name} ${toFa(year)}`}
              className={`ds-jalali__day ds-tabular ${isEdge ? 'is-edge' : ''} ${inSpan ? 'is-in-range' : ''}`.trim()}
              onClick={() => handleDayClick(d)}
            >
              {toFa(d)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default JalaliRangePicker;
