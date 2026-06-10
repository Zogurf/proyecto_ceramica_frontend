"use client";
import { useState, useEffect } from "react";
import { type AdminCategoryRequest, type AdminCategoryResponse } from "@/features/admin/services/admin-service";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdminCategoryRequest, id?: number) => Promise<void>;
  categoryToEdit: AdminCategoryResponse | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, categoryToEdit }: CategoryModalProps) {
  const [formData, setFormData] = useState<AdminCategoryRequest>({
    categoryName: "",
    label: "",
    description: "",
    imageUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        categoryName: categoryToEdit.categoryName || "",
        label: categoryToEdit.label || "",
        description: categoryToEdit.description || "",
        imageUrl: categoryToEdit.imageUrl || ""
      });
    } else {
      setFormData({ categoryName: "", label: "", description: "", imageUrl: "" });
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData, categoryToEdit?.categoryId);
      onClose();
    } catch (error) {
      alert("Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          {categoryToEdit ? "Editar Categoría" : "Nueva Categoría"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre de la Categoría</label>
            <input
              type="text" required
              value={formData.categoryName}
              onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Etiqueta (Label)</label>
            <input
              type="text" required
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">URL de Imagen</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
