import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import {
  Capsule,
  FleetAlertBanner,
  JalaliRangePicker,
  RtlTelemetryChart,
  SignalPath,
  TelemetryTable,
} from '../../ds/index.js';

export default function FleetOperationsSection() {
  const [rangeInfo, setRangeInfo] = useState({
    formatted: '۱ تا ۷ آبان ۱۴۰۵',
    dayCount: 7,
  });

  return (
    <section id="telemetry-ops" className="fleet-section">
      <div className="site-container ds-stack-lg">
        <div className="section-head-center">
          <Capsule variant="accent">
            <Activity size={14} aria-hidden="true" />
            <span>میز کار عملیات و تله‌متری شمسی ناوگان</span>
          </Capsule>
          <h2 className="section-title-3d">
            گزارش‌گیری تاریخ شمسی، نمودار راست‌به‌چپ و جدول هم‌عرض ناوگان
          </h2>
          <p className="section-subtitle">
            ابزارهای روزمره مدیران ترابری و اپراتورهای اتاق فرمان با ارقام فارسی هم‌عرض، پالت وضعیت‌های هم‌تراز در فضای ادراکی OKLCH و تقویم بومی شمسی.
          </p>
          <SignalPath label="مسیر جریان داده تله‌متری بین واحدهای ناوگان و اتاق فرمان" />
        </div>

        <div className="ops-grid">
          <JalaliRangePicker
            onChange={(next) =>
              setRangeInfo({ formatted: next.formatted, dayCount: next.dayCount })
            }
          />
          <RtlTelemetryChart dayCount={rangeInfo.dayCount} />
        </div>

        <FleetAlertBanner />

        <TelemetryTable rangeLabel={rangeInfo.formatted} />
      </div>
    </section>
  );
}
