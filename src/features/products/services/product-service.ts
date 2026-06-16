import { apiRequest } from "@/lib/api-client";
import type { ProductDetail } from "@/types/product";
import type { FeaturedProduct } from "@/types/product";

export const productService = {
  getFeaturedProducts: () =>
    apiRequest<FeaturedProduct[]>("/api/products"),
};

export function getProductById(productId: number) {
  return apiRequest<ProductDetail>(`/api/products/${productId}`);
}
