"use client";

import { useEffect, useState } from "react";
import {
  adminService,
  type AdminCategoryResponse,
  type AdminProductRequest,
  type AdminProductResponse,
} from "@/features/admin/services/admin-service";
import ProductModal from "./ProductModal";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductResponse[]>([]);
  const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<AdminProductResponse | null>(null);
  
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [productsData, categoriesData] = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al cargar los datos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Estas seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      await adminService.deleteProduct(id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
    } catch (err: unknown) {
      alert("Error al eliminar: " + getErrorMessage(err, "Error al eliminar"));
    }
  };

  const handleSave = async (data: AdminProductRequest, id?: number) => {
    if (id) {
      const updated = await adminService.updateProduct(id, data);
      setProducts((currentProducts) =>
        currentProducts.map((product) => (product.id === id ? updated : product))
      );
      return;
    }

    const created = await adminService.createProduct(data);
    setProducts((currentProducts) => [...currentProducts, created]);
  };

  const openNewModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: AdminProductResponse) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("http://localhost:8080/api/excel/products"); 
      if (!response.ok) throw new Error("Error al exportar");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productos_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Hubo un problema al exportar el Excel");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Gestion de Productos</h1>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? "Exportando..." : "Exportar a Excel"}
          </button>
          <button
            onClick={openNewModal}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {product.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                  {product.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  S/ {product.price}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {product.stock}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(product)}
                    className="mr-4 text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        productToEdit={productToEdit}
        categories={categories}
      />
    </div>
  );
}
