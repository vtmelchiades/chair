"use client";

/**
 * Carrinho global: Context + reducer (docs/02 §2.1).
 * O drawer monta lazy no primeiro addItem — o botão de adicionar existe
 * sempre; o Sheet só hidrata sob demanda (INP, docs/02 §2.5).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { formatBRL } from "@/lib/pricing";
import { CartDrawer } from "./CartDrawer";

export interface CartItem {
  key: string; // slug + tier/variante
  productId: string;
  slug: string;
  name: string;
  tierLabel: string;
  quantity: number; // nº de tiers (multiplica tier.quantity)
  unitsPerTier: number;
  unitPriceCents: number;
  totalCents: number;
}

type Action =
  | { type: "add"; item: CartItem }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "hydrate"; items: CartItem[] };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = state.find((i) => i.key === action.item.key);
      if (existing) {
        return state.map((i) =>
          i.key === action.item.key
            ? {
                ...i,
                quantity: i.quantity + action.item.quantity,
                totalCents: (i.quantity + action.item.quantity) * i.unitsPerTier * i.unitPriceCents,
              }
            : i,
        );
      }
      return [...state, action.item];
    }
    case "setQty": {
      if (action.quantity <= 0) return state.filter((i) => i.key !== action.key);
      return state.map((i) =>
        i.key === action.key
          ? { ...i, quantity: action.quantity, totalCents: action.quantity * i.unitsPerTier * i.unitPriceCents }
          : i,
      );
    }
    case "remove":
      return state.filter((i) => i.key !== action.key);
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: CartItem) => void;
  setQty: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  lastAddedName: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "chair-cart-v1";
/** Frete grátis Sudeste acima de R$ 300 (política atual mantida). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 30000;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [] as CartItem[]);
  const [open, setOpen] = useState(false);
  const [drawerLoaded, setDrawerLoaded] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Hidratação do localStorage (após mount — não afeta SSR/CLS)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) as CartItem[] });
    } catch {
      /* storage corrompido: começa vazio */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* modo privado: ignora */
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setDrawerLoaded(true); // lazy: drawer só monta no primeiro add
    dispatch({ type: "add", item });
    setLastAddedName(item.name);
    setOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.quantity * i.unitsPerTier, 0);
    const subtotalCents = items.reduce((acc, i) => acc + i.totalCents, 0);
    return {
      items,
      count,
      subtotalCents,
      addItem,
      setQty: (key, quantity) => dispatch({ type: "setQty", key, quantity }),
      removeItem: (key) => dispatch({ type: "remove", key }),
      open,
      setOpen,
      lastAddedName,
    };
  }, [items, addItem, open, lastAddedName]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Slot reservado: o drawer é overlay (fixed) — CLS zero (docs/02 §2.4) */}
      {drawerLoaded && <CartDrawer />}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}

export function freeShippingProgress(subtotalCents: number) {
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
  return {
    eligible: remaining <= 0,
    remainingCents: Math.max(0, remaining),
    label:
      remaining <= 0
        ? "Frete grátis Sudeste desbloqueado"
        : `Faltam ${formatBRL(remaining)} para frete grátis no Sudeste`,
  };
}
