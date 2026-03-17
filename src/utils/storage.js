import { STORAGE_KEY, HW_PRESET_KEY, CALC_CACHE_KEY } from "../constants";

export function loadPresets() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
export function saveToStorage(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch { return false; } }

export function loadHwPresets() { try { const r = localStorage.getItem(HW_PRESET_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
export function saveHwPresets(list) { try { localStorage.setItem(HW_PRESET_KEY, JSON.stringify(list)); } catch {} }

export function loadCalcCache() { try { const r = localStorage.getItem(CALC_CACHE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
export function saveCalcCache(data) { try { localStorage.setItem(CALC_CACHE_KEY, JSON.stringify(data)); } catch {} }
