import { apiRequest } from "@/lib/api-client";

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AdminProductResponse {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: boolean;
  categoryId: number;
  categoryName: string;
}

export interface AdminProductRequest {
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: boolean;
  categoryId: number;
}

// aca habia bug :'v
export interface AdminCategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string;
  imageUrl: string;
  label: string;
}

export interface AdminCategoryRequest {
  label: string;
  categoryName: string;
  description: string;
  imageUrl: string;
}

export interface AdminOrderItemResponse {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sizeName?: string;
  sizeDimension?: string;
}

export interface AdminOrderResponse {
  id: number;
  status: string;
  registerDate: string;
  total: number;
  customerName: string;
  items: AdminOrderItemResponse[];
}

export interface PurchaseIntentResponse {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  email: string;
  viewedAt: string;
}

export interface CampaignRequest {
  productId: number;
  theme: string;
  offerText: string;
  startDate?: string;
  endDate?: string;
  subject?: string;
}

export interface CampaignResponse {
  recipients: number;
  subject: string;
  htmlPreview: string;
}

export const adminService = {
  getUsers: () => apiRequest<AdminUserResponse[]>("/api/admin/users"),

  getProducts: () => apiRequest<AdminProductResponse[]>("/api/admin/products"),

  createProduct: (data: AdminProductRequest) =>
    apiRequest<AdminProductResponse>("/api/admin/products", {
      method: "POST",
      body: data
    }),

  updateProduct: (id: number, data: AdminProductRequest) =>
    apiRequest<AdminProductResponse>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: data
    }),

  deleteProduct: (id: number) =>
    apiRequest<void>(`/api/admin/products/${id}`, {
      method: "DELETE"
    }),

  getCategories: () => apiRequest<AdminCategoryResponse[]>("/api/categories/list"),

  createCategory: (data: AdminCategoryRequest) =>
    apiRequest<AdminCategoryResponse>("/api/categories", {
      method: "POST",
      body: data
    }),

  updateCategory: (id: number, data: AdminCategoryRequest) =>
    apiRequest<AdminCategoryResponse>(`/api/categories/${id}`, {
      method: "PUT",
      body: data
    }),

  deleteCategory: (id: number) =>
    apiRequest<void>(`/api/categories/${id}`, {
      method: "DELETE"
    }),

  getOrders: () => apiRequest<AdminOrderResponse[]>("/api/admin/orders"),

  getPurchaseIntentions: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    return apiRequest<PurchaseIntentResponse[]>(
      `/api/admin/purchase-intentions${query ? `?${query}` : ""}`
    );
  },

  sendCampaign: (data: CampaignRequest) =>
    apiRequest<CampaignResponse>("/api/admin/campaigns", {
      method: "POST",
      body: data
    }),
};
