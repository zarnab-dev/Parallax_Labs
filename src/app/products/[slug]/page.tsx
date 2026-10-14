import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMediaPanel } from "@/components/catalog/ProductMediaPanel";
import { ProductPurchasePanel } from "@/components/catalog/ProductPurchasePanel";
import products from "@/data/products.json";
import type { Product } from "@/types/product";

const typedProducts = products as Product[];

export function generateStaticParams() {
  return typedProducts.map((p) => ({ slug: p.slug }));
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = typedProducts.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <article>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M12.5 15.5 7 10l5.5-5.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to catalog
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductMediaPanel product={product} />
        <ProductPurchasePanel product={product} />
      </div>
    </article>
  );
}
