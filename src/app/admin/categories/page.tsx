"use client";
import { useEffect, useState } from "react";
import { adminService, type AdminCategoryResponse, type AdminCategoryRequest } from "@/features/admin/services/admin-service";
import CategoryModal from "./CategoryModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategoryResponse | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setCategories(await adminService.getCategories());
    } catch (error) {
      alert("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;
    try {
      await adminService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.categoryId !== id));
    } catch (error) {
      alert("Error al eliminar la categoría");
    }
  };

  const handleSave = async (data: AdminCategoryRequest, id?: number) => {
    if (id) {
      const updated = await adminService.updateCategory(id, data);
      setCategories((prev) => prev.map((c) => (c.categoryId === id ? updated : c)));
    } else {
      const created = await adminService.createCategory(data);
      setCategories((prev) => [...prev, created]);
    }
  };

  const openNewModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminCategoryResponse) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-slate-500 p-6">Cargando categorías...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Categorías</h1>
        <button onClick={openNewModal} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + Nueva Categoría
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Etiqueta</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {categories.map((category) => (
              <tr key={category.categoryId} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">{category.categoryId}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{category.categoryName}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{category.label}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => openEditModal(category)} className="mr-4 text-indigo-600 hover:text-indigo-900">Editar</button>
                  <button onClick={() => handleDelete(category.categoryId)} className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-slate-500">No hay categorías registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
}
