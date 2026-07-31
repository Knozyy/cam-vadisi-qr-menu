import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "cam-vadisi-listem-v2";

function initialQuantities() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .map(([id, quantity]) => [
          id,
          Math.max(0, Math.min(20, Number(quantity) || 0)),
        ])
        .filter(([, quantity]) => quantity > 0),
    );
  } catch {
    return {};
  }
}

export function useMenuList() {
  const [quantities, setQuantities] = useState(initialQuantities);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(quantities));
    } catch {
      /* Depolama kapaliysa liste bu oturumda calismaya devam eder. */
    }
  }, [quantities]);

  const setQuantity = useCallback((id, nextQuantity) => {
    setQuantities((current) => {
      const quantity = Math.max(0, Math.min(20, Number(nextQuantity) || 0));
      const next = { ...current };
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }, []);

  const increment = useCallback((id) => {
    setQuantities((current) => ({
      ...current,
      [id]: Math.min(20, (current[id] ?? 0) + 1),
    }));
  }, []);

  const decrement = useCallback((id) => {
    setQuantities((current) => {
      const quantity = Math.max(0, (current[id] ?? 0) - 1);
      const next = { ...current };
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }, []);

  const clear = useCallback(() => setQuantities({}), []);
  const count = useMemo(
    () =>
      Object.values(quantities).reduce(
        (total, quantity) => total + quantity,
        0,
      ),
    [quantities],
  );
  const get = useCallback((id) => quantities[id] ?? 0, [quantities]);

  return {
    quantities,
    count,
    get,
    setQuantity,
    increment,
    decrement,
    clear,
  };
}
