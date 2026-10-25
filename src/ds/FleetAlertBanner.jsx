import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Snowflake, ShieldCheck } from 'lucide-react';
import { Button } from './Button.jsx';

const ALERT_ICONS = {
  critical: AlertTriangle,
  idle: Clock,
  'cold-chain': Snowflake,
  moving: CheckCircle2,
};

const DEFAULT_ALERTS = [
  {
    id: 'AL-901',
    severity: 'critical',
    title: 'تجاوز سرعت و خروج از ژئوفنس محور مشهد — سمنان',
    meta: 'کامیون ۷۷ ع ۱۹۵ (ایران ۱۵) · سرعت ثبت‌شده: ۱۰۴ km/h · ساعت ۱۴:۴۲',
  },
  {
    id: 'AL-884',
    severity: 'cold-chain',
    title: 'پایداری دمای محفظه یخچالی دارو در محور اصفهان — شیراز',
    meta: 'کشنده ۶۲ ع ۳۱۴ (ایران ۴۳) · دمای فعلی: ‎-۱۸.۴ °C · نوسان ۰.۲ درجه',
  },
  {
    id: 'AL-872',
    severity: 'idle',
    title: 'توقف درجا بیش از ۲۰ دقیقه با موتور روشن در عوارضی قزوین',
    meta: 'وانت ۲۴ د ۸۵۱ (ایران ۶۸) · مصرف درجا: ۱.۸ لیتر · پیشنهاد خاموشی ارسال شد',
  },
];

export function FleetAlertBanner({ alerts = DEFAULT_ALERTS }) {
  const [ackedIds, setAckedIds] = useState({});

  const toggleAck = (id) => {
    setAckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="ds-alert-list" role="region" aria-label="هشدارهای عملیاتی ناوگان">
      {alerts.map((item) => {
        const Icon = ALERT_ICONS[item.severity] || AlertTriangle;
        const isAcked = Boolean(ackedIds[item.id]);
        return (
          <div
            key={item.id}
            role="status"
            className={`ds-alert-card ds-alert-card--${item.severity} ${isAcked ? 'is-acked' : ''}`.trim()}
          >
            <div className="ds-alert-card__body">
              <span className="ds-alert-card__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <strong className="ds-alert-card__title">{item.title}</strong>
                <div className="ds-alert-card__meta ds-tabular">{item.meta}</div>
              </div>
            </div>
            <Button
              variant={isAcked ? 'ghost' : 'secondary'}
              size="sm"
              aria-pressed={isAcked}
              onClick={() => toggleAck(item.id)}
            >
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{isAcked ? 'ثبت شد در شیفت' : 'تأیید اپراتور'}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default FleetAlertBanner;
