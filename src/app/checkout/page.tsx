"use client";

import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { CartStep } from "@/components/checkout/CartStep";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { ConfirmationStep } from "@/components/checkout/ConfirmationStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { ShippingStep } from "@/components/checkout/ShippingStep";
import { checkoutMachine } from "@/features/checkout/checkoutMachine";
import { useCart } from "@/features/cart/CartProvider";
import { useInventory } from "@/features/inventory/InventoryProvider";

export default function CheckoutPage() {
  const [state, send] = useMachine(checkoutMachine);
  const { items, clearCart } = useCart();
  const { broadcastPurchase } = useInventory();

  const isConfirmation = state.matches("confirmation");

  // The cart is cleared once, right when the order is confirmed — not
  // before, so a failed/abandoned checkout leaves the cart untouched. The
  // purchase is broadcast first (best-effort — see InventorySocket.send)
  // so other open tabs see the stock decrease live.
  useEffect(() => {
    if (!isConfirmation) return;
    broadcastPurchase(
      items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
    );
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmation]);

  const currentIndex = state.matches("cart")
    ? 0
    : state.matches("shipping")
    ? 1
    : state.matches("payment")
    ? 2
    : 3;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Checkout
      </h1>
      <CheckoutSteps currentIndex={currentIndex} />

      {state.matches("cart") && (
        <CartStep onNext={() => send({ type: "NEXT" })} />
      )}

      {state.matches("shipping") && (
        <ShippingStep
          initialValue={state.context.shipping}
          onSubmit={(data) => send({ type: "SUBMIT_SHIPPING", data })}
          onBack={() => send({ type: "BACK" })}
        />
      )}

      {state.matches("payment") && (
        <PaymentStep
          initialValue={state.context.payment}
          isSubmitting={state.matches({ payment: "processing" })}
          submitError={state.context.paymentError}
          onSubmit={(data) => send({ type: "SUBMIT_PAYMENT", data })}
          onBack={() => send({ type: "BACK" })}
        />
      )}

      {isConfirmation && <ConfirmationStep orderId={state.context.orderId} />}

      {!isConfirmation && items.length === 0 && !state.matches("cart") && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Your cart is empty — nothing left to check out.
        </p>
      )}
    </div>
  );
}
