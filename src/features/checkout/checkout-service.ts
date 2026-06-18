import { apiRequest } from "@/lib/api-client";
import type { CartItem } from "@/features/cart/cart-context";

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
  orderId: number;
}

export interface CheckoutCustomerInfo {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingReference?: string;
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
  fulfillmentStatus: string;
  registerDate: string;
  total: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingReference?: string;
  items: OrderItemResponse[];
}

export function createCheckoutSession(items: CartItem[], customerInfo: CheckoutCustomerInfo) {
  return apiRequest<CheckoutResponse>("/api/checkout/session", {
    method: "POST",
    body: {
      ...customerInfo,
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

export function getMyOrders() {
  return apiRequest<OrderResponse[]>("/api/checkout/orders");
}

export function getMyOrder(orderId: number) {
  return apiRequest<OrderResponse>(`/api/checkout/orders/${orderId}`);
}
