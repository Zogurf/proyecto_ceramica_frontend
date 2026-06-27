"use client";

import { useState, useEffect } from "react";
import {
  adminService,
  type AdminCategoryRequest,
  type AdminCategoryResponse,
} from "@/features/admin/services/admin-service";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdminCategoryRequest, id?: number) => Promise<void>;
  categoryToEdit: AdminCategoryResponse | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<AdminCategoryRequest>({
    categoryName: "",
    label: "",
    description: "",
    imageUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        categoryName: categoryToEdit.categoryName || "",
        label: categoryToEdit.label || "",
        description: categoryToEdit.description || "",
        imageUrl: categoryToEdit.imageUrl || "",
      });

      setPreview(categoryToEdit.imageUrl || null);
      setSelectedFile(null);
    } else {
      setFormData({
        categoryName: "",
        label: "",
        description: "",
        imageUrl: "",
      });

      setPreview(null);
      setSelectedFile(null);
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar los 5 MB");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(null);

    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      if (selectedFile) {
        const result = await adminService.uploadImage(selectedFile, "categorias");
        imageUrl = result.imageUrl;
      }

      await onSave(
        {
          ...formData,
          imageUrl,
        },
        categoryToEdit?.categoryId
      );

      onClose();
    } catch (error) {
      alert("Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          {categoryToEdit ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre de la Categoría
            </label>

            <input
              type="text"
              required
              value={formData.categoryName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryName: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Etiqueta (Label)
            </label>

            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  label: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Descripción
            </label>

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Imagen
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            />

            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="aspect-square w-full rounded-lg border object-cover"
                />

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    Eliminar imagen
                  </button>
                </div>
              </div>
            )}

            {!preview && (
              <p className="mt-1 text-xs text-slate-400">
                Opcional. Puedes crear la categoría sin imagen.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
