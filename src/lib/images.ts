export const DEFAULT_PRODUCT_IMAGE = "/categorias/default.webp";

export function getProductImageSrc(imageUrl?: string | null) {
  const value = imageUrl?.trim();
  return value ? value : DEFAULT_PRODUCT_IMAGE;
}
