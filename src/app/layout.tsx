import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { CartProvider } from "@/features/cart/CartProvider";
import { PwaStatus } from "@/features/pwa/PwaStatus";
import { InventoryProvider } from "@/features/inventory/InventoryProvider";
import { MockingProvider } from "@/mocks/MockingProvider";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export const metadata: Metadata = {
  applicationName: "NorthlineGoods",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Northline", statusBarStyle: "default" },
  title: "NorthlineGoods — E-commerce Storefront",
  description:
    "A production-grade e-commerce storefront, built incrementally as a frontend internship project.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before hydration to prevent a light/dark flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-2 top-2 z-50 rounded-md bg-brand-600 px-4 py-2 text-white"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <InventoryProvider>
                <MockingProvider>
                  <Header />
                  <main
                    id="main-content"
                    className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
                  >
                    {children}
                  </main>
                  <Footer />
                  <PwaStatus />
                </MockingProvider>
              </InventoryProvider>
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
