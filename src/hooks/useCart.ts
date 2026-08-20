// useCart — persistent cart for members and guests alike. Lives in
// localStorage, so it survives sign-in/out without reconciliation work: the
// same browser keeps the same cart either way.
import { useCallback, useEffect, useState } from "react";
import {
  addToCart as addLine, cartCount, readCart, setCartQuantity,
  type CartLine,
} from "@/lib/shop";

export const useCart = () => {
  const [lines, setLines] = useState<CartLine[]>(() => readCart());

  // Keep multiple components on the page in sync (drawer + badges).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "mindcast.shop.cart.v1") setLines(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((slug: string, quantity: number, variantId?: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug && (l as CartLine & { variant_id?: string }).variant_id === variantId);
      let next: CartLine[];
      if (existing) {
        next = prev.map((l) => l === existing
          ? { ...l, quantity: Math.min(20, l.quantity + quantity) }
          : l);
      } else {
        next = [...prev, { slug, quantity, ...(variantId ? { variant_id: variantId } : {}) } as CartLine];
      }
      try { localStorage.setItem("mindcast.shop.cart.v1", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number, variantId?: string) => {
    setLines((prev) => {
      const next = quantity <= 0
        ? prev.filter((l) => !(l.slug === slug && (l as CartLine & { variant_id?: string }).variant_id === variantId))
        : prev.map((l) => (l.slug === slug && (l as CartLine & { variant_id?: string }).variant_id === variantId)
          ? { ...l, quantity: Math.min(20, quantity) }
          : l);
      try { localStorage.setItem("mindcast.shop.cart.v1", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    try { localStorage.removeItem("mindcast.shop.cart.v1"); } catch { /* ignore */ }
  }, []);

  return { lines, add, setQuantity, clear, count: cartCount(lines) };
};

export type { CartLine };
export { addLine };
