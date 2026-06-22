import { apiRequest } from "@/lib/api-client";

export interface FavoriteProduct {
  productId: number; name: string; price: number; imageUrl: string; stock: number; categoryName: string;
}
export const getFavorites = () => apiRequest<FavoriteProduct[]>("/api/favorites");
export const addFavorite = (productId: number) => apiRequest<FavoriteProduct>(`/api/favorites/${productId}`, { method: "POST" });
export const removeFavorite = (productId: number) => apiRequest<void>(`/api/favorites/${productId}`, { method: "DELETE" });
