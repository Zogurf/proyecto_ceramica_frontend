import { apiRequest } from "@/lib/api-client";
import type { CartItem } from "@/features/cart/cart-context";

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
  orderId: number;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sizeName?: string;
  sizeDimension?: string;
}

export interface OrderResponse {
  id: number;
  status: string;
  registerDate: string;
  total: number;
  customerName: string;
  items: OrderItemResponse[];
}

export function createCheckoutSession(items: CartItem[]) {
  return apiRequest<CheckoutResponse>("/api/checkout/session", {
    method: "POST",
    body: {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        sizeName: item.sizeName,
        sizeDimension: item.sizeDimension,
      })),
    },
  });
}

export function confirmCheckoutSession(sessionId: string) {
  return apiRequest<OrderResponse>(`/api/checkout/confirm?sessionId=${encodeURIComponent(sessionId)}`);
}
