import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/formatPrice";

export function CartStep({ onNext }: { onNext: () => void }) {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {item.title}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {item.variantLabel} × {item.quantity}
              </p>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <Button className="mt-6 w-full" size="lg" onClick={onNext}>
        Continue to shipping
      </Button>
    </div>
  );
}
