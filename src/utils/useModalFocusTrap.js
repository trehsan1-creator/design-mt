import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * تله فوکوس صفحه‌کلید (Focus Trap) برای دیالوگ‌ها و منوهای موبایل
 * با فشردن Escape بسته می‌شود و پس از بستن، فوکوس را به دکمه بازکننده بازمی‌گرداند.
 */
export function useModalFocusTrap(open, onClose) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prevFocused = document.activeElement;
    const el = containerRef.current;

    const focusables = () =>
      el ? Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR)).filter((n) => n.offsetParent !== null) : [];

    const initialList = focusables();
    if (initialList.length > 0) {
      initialList[0].focus();
    } else if (el) {
      el.focus();
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (prevFocused && typeof prevFocused.focus === 'function') {
        prevFocused.focus();
      }
    };
  }, [open, onClose]);

  return containerRef;
}

export default useModalFocusTrap;
