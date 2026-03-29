import { useState, useEffect } from 'react';

/**
 * Computes and ticks down the remaining "ready in" minutes for a product.
 *
 * Logic:
 *   - The owner sets `readyAt` (e.g. 30 minutes).
 *   - The product's `updatedAt` timestamp records exactly when that was saved.
 *   - Remaining = readyAt - Math.floor((now - updatedAt) / 60_000)
 *   - Returns null when there's no readyAt, or when the timer has expired (≤ 0).
 *   - Ticks every 30 seconds so the UI stays accurate.
 */
export function useReadyCountdown(
  readyAt: number | null | undefined,
  updatedAt: string | undefined,
): number | null {
  const computeRemaining = (): number | null => {
    if (!readyAt || readyAt <= 0 || !updatedAt) return null;
    const elapsedMs = Date.now() - new Date(updatedAt).getTime();
    const elapsedMinutes = Math.floor(elapsedMs / 60_000);
    const remaining = readyAt - elapsedMinutes;
    return remaining > 0 ? remaining : null;
  };

  const [remaining, setRemaining] = useState<number | null>(computeRemaining);

  useEffect(() => {
    if (!readyAt || readyAt <= 0 || !updatedAt) {
      setRemaining(null);
      return;
    }

    setRemaining(computeRemaining());

    const interval = setInterval(() => {
      const r = computeRemaining();
      setRemaining(r);
      if (r === null) clearInterval(interval);
    }, 30_000);

    return () => clearInterval(interval);
  }, [readyAt, updatedAt]);

  return remaining;
}

/** Formats remaining minutes into a human-readable string like "45m", "1h 30m", "2d" */
export function formatReadyAt(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}
