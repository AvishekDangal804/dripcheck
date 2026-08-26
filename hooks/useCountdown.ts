"use client";

import { useEffect, useState } from "react";

export function useCountdown(startFrom: number, onComplete: () => void, active: boolean) {
  const [count, setCount] = useState(startFrom);
  const [wasActive, setWasActive] = useState(active);

  // Reset the count when `active` flips off, using the React-endorsed
  // "adjust state during render" pattern instead of an effect, since an
  // effect that unconditionally calls setState on mount triggers a
  // cascading-render lint error (react-hooks/set-state-in-effect).
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setCount(startFrom);
  }

  useEffect(() => {
    if (!active || count === 0) return;
    const timeout = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
  }, [active, count]);

  useEffect(() => {
    if (active && count === 0) onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count]);

  return count;
}
