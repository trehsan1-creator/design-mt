import React, { useState } from 'react';
import { PackageCheck, Lock, Route, BellRing } from 'lucide-react';
import { Card, Capsule, SignalPath, StatusChip } from '../../ds/index.js';

const STAGES = [
  {
    step: '۰۱',
    title: 'بارگیری و قفل پلمپ هوشمند GPS',
    time: '۰۶:۳۰ صبح · پایانه مبدأ',
    desc: 'با بسته شدن درب کانتینر، پلمپ الکترونیکی فعال شده و مانیفست بار به پلاک کشنده و راننده متصل می‌گردد.',
    metric: 'ثبت خودکار بیجک و وزن باسکول',
    icon: Lock,
  },
  {
    step: '۰۲',
    title: 'مسیریابی پویا روی کریدور ترانزیتی',
    time: '۱۰:۱۵ صبح · آزادراه خلیج فارس',
    desc: 'سامانه ترافیک، شیب جاده و نقاط حادثه‌خیز را تحلیل کرده و مسیر بهینه را در اختیار راننده قرار می‌دهد.',
    metric: 'صرفه‌جویی ۱۴٪ زمان ترانزیت',
    icon: Route,
  },
  {
    step: '۰۳',
    title: 'پایش زنجیره سرد و هشدار انحراف',
    time: '۱۴:۴۰ ظهر · گذرگاه کوهستانی',
    desc: 'در نقاط فاقد پوشش موبایل، حافظه داخلی و ارتباط ماهواره‌ای مسیر را بدون گسست ثبت و باز شدن درب را گزارش می‌کنند.',
    metric: 'ثبات دمای محموله حساس',
    icon: BellRing,
  },
  {
    step: '۰۴',
    title: 'تحویل در مقصد و تسویه خودکار',
    time: '۱۸:۱۰ عصر · اسکله شهید رجایی',
    desc: 'با ورود خودرو به محدوده مقصد، رسید دیجیتال صادر شده و گزارش مصرف سوخت و کارکرد راننده بایگانی می‌شود.',
    metric: 'خروجی PDF و اکسل یکپارچه',
    icon: PackageCheck,
  },
];

export default function JourneyTimelineSection() {
  const [activeIdx, setActiveIdx] = useState(1);
  const pct = `${((activeIdx + 1) / STAGES.length) * 100}%`;

  return (
    <section id="journey" className="fleet-section">
      <div className="site-container">
        <div className="section-header-center">
          <Capsule variant="eyebrow">
            <Route size={15} aria-hidden="true" />
            <span>سناریوی عملیاتی جاده · پیگیری سیگنال از مبدأ تا مقصد</span>
          </Capsule>
          <h2 className="section-title-xl">
            سفر هوشمند یک محموله، مرحله به مرحله تحت نظارت اتاق عملیات
          </h2>
        </div>

        <Card variant="panel">
          <SignalPath label="مسیر پیوسته انتقال سیگنال در چهار مرحله سفر محموله" />
          <div className="journey-progress-track" aria-hidden="true">
            <div className="journey-progress-fill" style={{ '--journey-pct': pct }} />
          </div>

          <div className="timeline-grid">
            {STAGES.map((st, idx) => {
              const Icon = st.icon;
              const isAct = idx === activeIdx;
              return (
                <Card
                  key={st.step}
                  as="button"
                  type="button"
                  variant={isAct ? 'chisel' : 'panel'}
                  interactive
                  accentOutline={isAct}
                  className="timeline-step-card"
                  onClick={() => setActiveIdx(idx)}
                >
                  <div className="ds-between">
                    <div className="timeline-step-num">
                      <Icon size={19} aria-hidden="true" />
                    </div>
                    <strong className="hero-kpi-item__val ds-accent-text ds-tabular">{st.step}</strong>
                  </div>

                  <span className="ds-accent-soft-text">{st.time}</span>
                  <h3>{st.title}</h3>
                  <p className="ds-muted">{st.desc}</p>

                  <div>
                    <StatusChip status="moving" label={st.metric} />
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}
