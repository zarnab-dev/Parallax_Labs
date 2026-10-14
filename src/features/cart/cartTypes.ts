export interface CartItem {
  id: string; // `${productId}::${variantId}`
  productId: string;
  productSlug: string;
  variantId: string;
  title: string;
  variantLabel: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export type CartEvent =
  | {
      type: "ADD_ITEM";
      item: Omit<CartItem, "quantity">;
      quantity: number;
    }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "SET_QUANTITY"; id: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "RESTORE_ITEMS"; items: CartItem[]; error: string };

export interface CartContext {
  items: CartItem[];
  lastError: string | null;
}
