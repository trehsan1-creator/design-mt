import React from 'react';

export function Button({
  variant = 'primary',
  size = 'md',
  active = false,
  fullWidth = false,
  as = 'button',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const Tag = as;
  const classes = [
    'ds-btn',
    `ds-btn--${variant}`,
    size !== 'md' ? `ds-btn--${size}` : '',
    fullWidth ? 'ds-btn--full' : '',
    active ? 'is-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (Tag === 'button') {
    return (
      <button type={type} className={classes} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export default Button;
