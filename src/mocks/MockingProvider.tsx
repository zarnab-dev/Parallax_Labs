"use client";

import { useEffect, useState } from "react";

const IS_DEV = process.env.NODE_ENV === "development";

let mockingStarted = false;

/**
 * Boots the MSW browser worker in development only, blocking render until
 * it's ready so the first fetch is guaranteed to be intercepted.
 *
 * In production this renders children immediately and MSW isn't loaded at
 * all: the same API contract is served by Next.js route handlers
 * (src/app/api/**), which avoids two service workers fighting over the same
 * scope now that the app ships its own PWA worker (public/sw.js).
 */
export function MockingProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!IS_DEV || mockingStarted);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (mockingStarted) {
        setReady(true);
        return;
      }
      import("@/mocks/browser")
        .then(({ worker }) =>
          worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: { url: "/mockServiceWorker.js" },
          })
        )
        .then(() => {
          mockingStarted = true;
          setReady(true);
        });
    }
  }, []);

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Starting mock API…</span>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
