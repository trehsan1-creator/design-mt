import React, { useState } from 'react';
import { Calculator, TrendingUp, Fuel, Clock } from 'lucide-react';
import { toFa } from '../../utils/faDigits.js';

export default function RoiCalculatorSection() {
  const [vehicles, setVehicles] = useState(45);
  const [monthlyKm, setMonthlyKm] = useState(8500);

  // Realistic fleet savings calculation
  const litersSavedMonth = Math.round(vehicles * (monthlyKm / 100) * 32 * 0.184);
  const hoursSavedMonth = Math.round(vehicles * 19);
  const millionTomanYear = Math.round((vehicles * (monthlyKm / 1000) * 1.45 * 12));

  const barCount = 24;
  const activeBars = Math.min(barCount, Math.max(3, Math.round((vehicles / 200) * barCount)));

  return (
    <section id="roi-calc" className="dark-section" style={{ paddingTop: 20 }}>
      <div className="site-container">
        <div
          className="cad-card"
          style={{
            padding: '38px 34px',
            background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
            border: '1px solid rgba(232, 222, 205, 0.22)',
          }}
        >
          <div className="section-grid" style={{ marginBottom: 0, alignItems: 'center' }}>
            {/* Right: Sliders */}
            <div>
              <div className="eyebrow-kaf">
                <Calculator size={15} />
                <span>شبیه‌ساز بازگشت سرمایه · برش‌های سرعتی ۲۶.۸۴° سرکش «ک»</span>
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 900, lineHeight: 1.3, marginBottom: 12 }}>
                چقدر از هزینه سوخت و استهلاک ناوگان شما پس‌انداز می‌شود؟
              </h2>
              <p style={{ fontSize: 14.5, color: 'rgba(232,222,205,0.8)', marginBottom: 26 }}>
                اسلایدرها را متناسب با ابعاد ناوگان خود تغییر دهید تا میزان صرفه‌جویی واقعی سالانه را ببینید:
              </p>

              {/* Slider 1: Fleet Count */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>تعداد خودروهای ناوگان:</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: '#FF742E' }}>{toFa(vehicles)} دستگاه</span>
                </div>
                <input
                  type="range"
                  className="cinema-range"
                  min="5"
                  max="250"
                  step="5"
                  value={vehicles}
                  onChange={(e) => setVehicles(Number(e.target.value))}
                />
              </div>

              {/* Slider 2: Monthly KM */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>میانگین پیمایش ماهانه هر خودرو:</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: '#E8DECD' }}>
                    {toFa(monthlyKm.toLocaleString('en-US'))} کیلومتر
                  </span>
                </div>
                <input
                  type="range"
                  className="cinema-range"
                  min="2000"
                  max="18000"
                  step="500"
                  value={monthlyKm}
                  onChange={(e) => setMonthlyKm(Number(e.target.value))}
                />
              </div>

              {/* 26.84 deg Kaf Velocity Strip */}
              <div style={{ display: 'flex', gap: 6, padding: '4px 6px' }}>
                {Array.from({ length: barCount }).map((_, i) => {
                  const lit = i < activeBars;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 22,
                        borderRadius: 3,
                        transform: 'skewX(-26.84deg)',
                        background: lit
                          ? i > barCount - 6
                            ? '#FF742E'
                            : '#E8DECD'
                          : 'rgba(232,222,205,0.1)',
                        transition: 'background 0.2s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Left: Sculpted Result Readout */}
            <div
              style={{
                background: 'rgba(7, 17, 26, 0.78)',
                borderRadius: 28,
                padding: '28px 26px',
                border: '1px solid rgba(255, 116, 46, 0.38)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
              }}
            >
              <div style={{ fontSize: 13, color: '#FFB085', fontWeight: 700, marginBottom: 6 }}>
                برآورد سود خالص و کاهش اتلاف سالانه ناوگان شما
              </div>
              <div style={{ fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 900, color: '#FF742E', lineHeight: 1.15 }}>
                {toFa(millionTomanYear.toLocaleString('en-US'))}{' '}
                <span style={{ fontSize: 18, color: '#E8DECD', fontWeight: 700 }}>میلیون تومان / سال</span>
              </div>

              <div className="kpi-2-grid" style={{ marginBlockStart: 22 }}>
                <div style={{ padding: 14, borderRadius: 18, background: 'rgba(232,222,205,0.06)', border: '1px solid rgba(232,222,205,0.1)' }}>
                  <Fuel size={18} color="#FF742E" />
                  <div style={{ fontSize: 22, fontWeight: 900, marginBlockStart: 6 }}>
                    {toFa(litersSavedMonth.toLocaleString('en-US'))} لیتر
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.76)' }}>صرفه‌جویی سوخت در ماه</div>
                </div>

                <div style={{ padding: 14, borderRadius: 18, background: 'rgba(232,222,205,0.06)', border: '1px solid rgba(232,222,205,0.1)' }}>
                  <Clock size={18} color="#4ADE80" />
                  <div style={{ fontSize: 22, fontWeight: 900, marginBlockStart: 6 }}>
                    {toFa(hoursSavedMonth.toLocaleString('en-US'))} ساعت
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.76)' }}>کاهش درجا کار کردن ماهانه</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
