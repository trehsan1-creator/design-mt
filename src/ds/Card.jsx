import React, { useState } from 'react';

export function Card({
  variant = 'panel',
  compact = false,
  interactive = false,
  accentOutline = false,
  tilt = false,
  polarity,
  as = 'div',
  className = '',
  children,
  ...rest
}) {
  const Tag = as;
  const [rot, setRot] = useState({ rx: 0, ry: 0 });

  const classes = [
    'ds-card',
    `ds-card--${variant}`,
    compact ? 'ds-card--compact' : '',
    interactive ? 'ds-card--interactive' : '',
    accentOutline ? 'ds-card--accent-outline' : '',
    tilt ? 'ds-card--tilt' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const tiltProps = tilt
    ? {
        onMouseMove: (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          setRot({ rx: Number((-ny * 8).toFixed(2)), ry: Number((nx * 10).toFixed(2)) });
        },
        onMouseLeave: () => setRot({ rx: 0, ry: 0 }),
        style: { '--ds-tilt-rx': `${rot.rx}deg`, '--ds-tilt-ry': `${rot.ry}deg` },
      }
    : {};

  return (
    <Tag
      className={classes}
      data-polarity={polarity}
      {...tiltProps}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Card;
