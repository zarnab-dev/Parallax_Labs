"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { isWebGLAvailable } from "@/lib/webglSupport";
import type { Product } from "@/types/product";

// The Three.js/React Three Fiber bundle is large; this keeps it entirely
// out of the main product-page bundle and only fetches it once the person
// actually opens the 3D tab.
const ProductViewer3DCanvas = dynamic(
  () => import("./ProductViewer3DCanvas").then((m) => m.ProductViewer3DCanvas),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-square w-full" />,
  }
);

function ViewerMessage({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="status"
      className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900"
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{body}</p>
    </div>
  );
}

/**
 * If anything in the 3D viewer fails — the lazy chunk can't be fetched
 * (offline and never opened before), WebGL context creation fails, a render
 * error — show a message instead of letting the error take down the page.
 */
class ViewerErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <ViewerMessage
          title="The 3D preview couldn't be loaded"
          body="Check your connection and try again, or use the Photos tab to view this product."
        />
      );
    }
    return this.props.children;
  }
}

export function ProductViewer3D({ product }: { product: Product }) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  if (webglSupported === null) {
    return <Skeleton className="aspect-square w-full" />;
  }

  if (!webglSupported) {
    return (
      <ViewerMessage
        title="3D preview isn't supported in this browser"
        body="Your browser or device doesn't support WebGL. Use the Photos tab to view this product instead."
      />
    );
  }

  return (
    <ViewerErrorBoundary>
      <ProductViewer3DCanvas product={product} />
    </ViewerErrorBoundary>
  );
}
