export const clamp = (v, min, max, fallback) => { const n = Number(v); return (isNaN(n) || !isFinite(n)) ? fallback : Math.min(Math.max(n, min), max); };

export const c  = (n, d = 0) => isNaN(n) || n == null ? "—" : Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const $c = (n, d = 0) => `$${c(n, d)}`;
export const $M = (n) => `$${c(n / 1e6, 2)}M`;
