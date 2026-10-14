import bundleAnalyzer from "@next/bundle-analyzer";

// `npm run analyze` writes interactive treemaps to .next/analyze/.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // msw's browser build intentionally has no "node" export condition; it's
  // only ever dynamically imported client-side in development (see
  // MockingProvider), so we exclude it from the server compiler's static
  // resolution.
  experimental: {
    serverComponentsExternalPackages: ["msw"],
  },
  webpack: (config, { isServer }) => {
    // msw v2 exposes separate browser/node entry points via package.json
    // "exports", each blocking the other's condition. Webpack still resolves
    // both branches during tree-shaking, so each is aliased away for the
    // compiler that will never actually use it.
    if (isServer) {
      config.resolve.alias["msw/browser"] = false;
    } else {
      config.resolve.alias["msw/node"] = false;
    }
    return config;
  },
  images: {
    // Applies to raster images (jpg/png) if/when real product photos are
    // added; the current SVG artwork is served directly (see ProductImage).
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // The worker script must always be revalidated so updates are noticed.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
