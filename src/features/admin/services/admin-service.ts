import { API_URL, apiRequest } from "@/lib/api-client";

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
  fulfillmentStatus: string;
  registerDate: string;
  total: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingReference?: string;
  customerPhone: string;
  items: AdminOrderItemResponse[];
}

export interface PurchaseIntentResponse {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  email: string;
  categoryName: string;
  interactionType: string;
  viewedAt: string;
}

export interface MetricPoint { label: string; value: number }
export interface DashboardResponse {
  totalRevenue: number; userCount: number; inventoryUnits: number; pendingOrders: number;
  lowStockProducts: number; revenueToday: MetricPoint[]; revenueWeekly: MetricPoint[];
  revenueMonthly: MetricPoint[]; inventoryByCategory: MetricPoint[]; interactionsByCategory: MetricPoint[];
  lowStock: { id: number; name: string; stock: number; categoryName: string }[];
}

export interface CategoryIntentAnalyticsResponse {
  categoryId: number; categoryName: string; interactions: number; uniqueCustomers: number;
  topProducts: { productId: number; productName: string; interactions: number }[];
}

export interface CampaignRequest {
  categoryId: number;
  offerText: string;
  startDate?: string;
  endDate?: string;
  subject: string;
  htmlTemplate?: string;
}

export interface CampaignResponse {
  recipients: number;
  subject: string;
  htmlPreview: string;
  categoryName: string;
  products: { id: number; name: string; price: number; imageUrl: string }[];
}

export interface UploadImageResponse {
  imageUrl: string;
  key: string;
}

async function uploadImage(file: File, folder: "productos" | "categorias" = "productos") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const headers = new Headers();
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}/api/admin/uploads/images`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || data?.message || `Error ${response.status}`);
  }

  return response.json() as Promise<UploadImageResponse>;
}

export const adminService = {
  uploadImage,

  getDashboard: () => apiRequest<DashboardResponse>("/api/admin/dashboard"),
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

  updateOrderFulfillment: (id: number, fulfillmentStatus: string) =>
    apiRequest<AdminOrderResponse>(`/api/admin/orders/${id}/fulfillment`, {
      method: "PUT",
      body: { fulfillmentStatus }
    }),

  getPurchaseIntentions: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    return apiRequest<PurchaseIntentResponse[]>(
      `/api/admin/purchase-intentions${query ? `?${query}` : ""}`
    );
  },

  getCategoryIntentions: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    return apiRequest<CategoryIntentAnalyticsResponse[]>(
      `/api/admin/purchase-intentions/categories${query ? `?${query}` : ""}`
    );
  },

  previewCampaign: (data: CampaignRequest) =>
    apiRequest<CampaignResponse>("/api/admin/campaigns/preview", {
      method: "POST",
      body: data
    }),

  sendCampaign: (data: CampaignRequest) =>
    apiRequest<CampaignResponse>("/api/admin/campaigns", {
      method: "POST",
      body: data
    }),
};
