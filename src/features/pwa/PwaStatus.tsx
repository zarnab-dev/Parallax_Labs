"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Registers the service worker (production only), surfaces an "update
 * available" prompt when a new version has installed in the background, and
 * shows an offline banner. Banners are fixed-position so they never shift
 * page content.
 */
export function PwaStatus() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const reloadRequested = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;

    // controllerchange also fires on the very first install (clients.claim),
    // so only reload when the person explicitly asked to update.
    const onControllerChange = () => {
      if (reloadRequested.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration?.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            // "installed" with an existing controller = an update, not the first install.
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setDismissed(false);
              setWaitingWorker(installing);
            }
          });
        });
      } catch {
        // Registration failure just means no offline support; the app still works.
      }
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onVisible = () => {
      if (document.visibilityState === "visible") registration?.update().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("load", register);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    reloadRequested.current = true;
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  const showUpdate = waitingWorker !== null && !dismissed;

  if (isOnline && !showUpdate) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-20 flex flex-col items-center gap-2 px-4 pt-2">
      {!isOnline && (
        <p
          role="status"
          className="pointer-events-auto rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 shadow dark:bg-amber-900/80 dark:text-amber-50"
        >
          You&apos;re offline — showing saved content.
        </p>
      )}
      {showUpdate && (
        <div
          role="status"
          className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
        >
          <span>A new version of the store is available.</span>
          <Button size="sm" onClick={applyUpdate}>
            Reload
          </Button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded px-1 text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Later
          </button>
        </div>
      )}
    </div>
  );
}
