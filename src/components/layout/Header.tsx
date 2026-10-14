"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ConnectionStatusBadge } from "@/components/inventory/ConnectionStatusBadge";
import { useCart } from "@/features/cart/CartProvider";

// The drawer isn't needed until the cart is first opened, so it's split out
// of the initial bundle and fetched on demand.
const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

export function Header() {
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartEverOpened, setCartEverOpened] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm dark:text-gray-100"
        >
          Northline<span className="text-brand-600">Goods</span>
        </Link>
        <nav aria-label="Utility" className="flex items-center gap-2">
          <ConnectionStatusBadge />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              setCartEverOpened(true);
              setCartOpen(true);
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg
              text-gray-600 hover:bg-gray-100 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-brand-500
              dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.5 3h2l2.3 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"
              />
            </svg>
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white"
              >
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
      {cartEverOpened && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
    </header>
  );
}
