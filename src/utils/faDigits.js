const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
