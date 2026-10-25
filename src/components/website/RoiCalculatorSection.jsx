import React, { useState } from 'react';
import { Calculator, Fuel, Clock } from 'lucide-react';
import { Card, Capsule, Gauge } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

export default function RoiCalculatorSection() {
  const [vehicles, setVehicles] = useState(45);
  const [monthlyKm, setMonthlyKm] = useState(8500);

  const litersSavedMonth = Math.round(vehicles * (monthlyKm / 100) * 32 * 0.184);
  const hoursSavedMonth = Math.round(vehicles * 19);
  const millionTomanYear = Math.round(vehicles * (monthlyKm / 1000) * 1.45 * 12);

  const barCount = 20;
  const activeBars = Math.min(barCount, Math.max(2, Math.round((vehicles / 250) * barCount)));

  return (
    <section id="roi-calc" className="fleet-section">
      <div className="site-container">
        <Card variant="chisel">
          <div className="section-grid">
            <div className="ds-stack-md">
              <div>
                <Capsule variant="eyebrow">
                  <Calculator size={15} aria-hidden="true" />
                  <span>شبیه‌ساز بازگشت سرمایه · برآورد صرفه‌جویی سوخت و استهلاک</span>
                </Capsule>
              </div>
              <h2 className="section-title-xl">
                میزان کاهش هزینه سوخت و توقف ناوگان را محاسبه کنید
              </h2>
              <p className="ds-muted">
                مقادیر زیر را متناسب با ابعاد ناوگان خود تنظیم کنید تا برآورد صرفه‌جویی سالانه محاسبه شود:
              </p>

              <div className="ds-stack-xs">
                <div className="ds-between">
                  <label htmlFor="roi-vehicles-range">تعداد خودروهای ناوگان:</label>
                  <strong className="hero-kpi-item__val ds-accent-text ds-tabular">
                    {toFa(vehicles)} دستگاه
                  </strong>
                </div>
                <input
                  id="roi-vehicles-range"
                  type="range"
                  className="cinema-range"
                  min="5"
                  max="250"
                  step="5"
                  value={vehicles}
                  onChange={(e) => setVehicles(Number(e.target.value))}
                />
              </div>

              <div className="ds-stack-xs">
                <div className="ds-between">
                  <label htmlFor="roi-km-range">میانگین پیمایش ماهانه هر خودرو:</label>
                  <strong className="hero-kpi-item__val ds-tabular">
                    {toFa(monthlyKm.toLocaleString('en-US'))} کیلومتر
                  </strong>
                </div>
                <input
                  id="roi-km-range"
                  type="range"
                  className="cinema-range"
                  min="2000"
                  max="18000"
                  step="500"
                  value={monthlyKm}
                  onChange={(e) => setMonthlyKm(Number(e.target.value))}
                />
              </div>

              <Gauge
                segments={barCount}
                activeCount={activeBars}
                label="شاخص مقیاس ناوگان"
                value={`${toFa(vehicles)} از ۲۵۰`}
                tone="accent"
              />
            </div>

            <Card variant="panel" accentOutline className="ds-stack-md">
              <span className="ds-accent-soft-text">
                برآورد صرفه‌جویی خالص و کاهش اتلاف سالانه ناوگان
              </span>
              <div className="ds-row-wrap ds-tabular">
                <strong className="section-title-xl ds-accent-text">
                  {toFa(millionTomanYear.toLocaleString('en-US'))}
                </strong>
                <span>میلیون تومان / سال</span>
              </div>

              <div className="kpi-2-grid">
                <Card variant="glass" compact className="ds-stack-xs">
                  <Fuel size={18} className="ds-accent-text" aria-hidden="true" />
                  <strong className="hero-kpi-item__val ds-tabular">
                    {toFa(litersSavedMonth.toLocaleString('en-US'))} لیتر
                  </strong>
                  <span className="ds-muted">صرفه‌جویی سوخت در ماه</span>
                </Card>

                <Card variant="glass" compact className="ds-stack-xs">
                  <Clock size={18} className="ds-accent-soft-text" aria-hidden="true" />
                  <strong className="hero-kpi-item__val ds-tabular">
                    {toFa(hoursSavedMonth.toLocaleString('en-US'))} ساعت
                  </strong>
                  <span className="ds-muted">کاهش درجا کار کردن ماهانه</span>
                </Card>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </section>
  );
}
