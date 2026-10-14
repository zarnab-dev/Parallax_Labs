import { assign, fromPromise, setup } from "xstate";
import type {
  CheckoutContext,
  CheckoutEvent,
  PaymentInfo,
  ShippingInfo,
} from "./checkoutTypes";
import { hasErrors, validatePayment, validateShipping } from "./checkoutValidation";

function generateOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

// Test-only decline card, matching the common "always declines" pattern
// used by real payment gateways' test suites (e.g. Stripe's 4000...0002),
// so the failure path is reliably demonstrable rather than only ever
// happening by random chance.
const ALWAYS_DECLINED_CARD = "4000000000000002";
const RANDOM_DECLINE_RATE = 0.1;

async function submitPayment(payment: PaymentInfo): Promise<{ orderId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const digitsOnly = payment.cardNumber.replace(/\s+/g, "");
  if (digitsOnly === ALWAYS_DECLINED_CARD) {
    throw new Error("Your card was declined. Please try a different card.");
  }
  if (Math.random() < RANDOM_DECLINE_RATE) {
    throw new Error("Payment could not be processed. Please try again.");
  }

  return { orderId: generateOrderId() };
}

export const checkoutMachine = setup({
  types: {
    context: {} as CheckoutContext,
    events: {} as CheckoutEvent,
  },
  guards: {
    shippingIsValid: (_, params: { data: ShippingInfo }) =>
      !hasErrors(validateShipping(params.data)),
    paymentIsValid: (_, params: { data: PaymentInfo }) =>
      !hasErrors(validatePayment(params.data)),
  },
  actors: {
    submitPaymentActor: fromPromise(async ({ input }: { input: PaymentInfo }) =>
      submitPayment(input)
    ),
  },
}).createMachine({
  id: "checkout",
  initial: "cart",
  context: {
    shipping: null,
    payment: null,
    orderId: null,
    paymentError: null,
  },
  states: {
    cart: {
      on: {
        NEXT: "shipping",
      },
    },
    shipping: {
      on: {
        SUBMIT_SHIPPING: {
          guard: {
            type: "shippingIsValid",
            params: ({ event }) => ({ data: event.data }),
          },
          actions: assign({ shipping: ({ event }) => event.data }),
          target: "payment",
        },
        BACK: "cart",
      },
    },
    payment: {
      initial: "editing",
      states: {
        editing: {
          on: {
            SUBMIT_PAYMENT: {
              guard: {
                type: "paymentIsValid",
                params: ({ event }) => ({ data: event.data }),
              },
              actions: assign({
                payment: ({ event }) => event.data,
                paymentError: null,
              }),
              target: "processing",
            },
            BACK: "#checkout.shipping",
          },
        },
        processing: {
          invoke: {
            src: "submitPaymentActor",
            input: ({ context }) => context.payment as PaymentInfo,
            onDone: {
              target: "#checkout.confirmation",
              actions: assign({
                orderId: ({ event }) => event.output.orderId,
              }),
            },
            onError: {
              target: "editing",
              actions: assign({
                paymentError: ({ event }) =>
                  event.error instanceof Error
                    ? event.error.message
                    : "Payment failed. Please try again.",
              }),
            },
          },
        },
      },
    },
    confirmation: {},
  },
});
