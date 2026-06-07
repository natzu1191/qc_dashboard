import { useEffect } from 'react';

function isEditable(el) {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable === true
  );
}

/**
 * useHotkey — bind a single-key shortcut that does not fire while the
 * user is typing in an input, contenteditable, or while a dialog has
 * focus.
 *
 * @param {string} key  Lowercased key (e.g. 'd', '/', 'escape')
 * @param {() => void} handler
 * @param {{ meta?: boolean, shift?: boolean, allowInInput?: boolean, enabled?: boolean }} [opts]
 */
export function useHotkey(key, handler, opts = {}) {
  const { meta = false, shift = false, allowInInput = false, enabled = true } = opts;

  useEffect(() => {
    if (!enabled) return;
    function onKey(e) {
      if (e.key.toLowerCase() !== key) return;
      if (meta !== (e.metaKey || e.ctrlKey)) return;
      if (shift !== e.shiftKey) return;
      if (!allowInInput && isEditable(document.activeElement)) return;
      e.preventDefault();
      handler(e);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, meta, shift, allowInInput, enabled]);
}
