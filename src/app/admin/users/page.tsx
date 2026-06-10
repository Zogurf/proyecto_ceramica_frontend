"use client";

import { useEffect, useState } from "react";
import { adminService, type AdminUserResponse } from "@/features/admin/services/admin-service";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        setUsers(await adminService.getUsers());
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al cargar usuarios";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="text-slate-500">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Gestion de Usuarios</h1>
        <p className="mt-2 text-sm text-slate-500">Usuarios registrados en la tienda.</p>
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
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Rol
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {user.role}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
