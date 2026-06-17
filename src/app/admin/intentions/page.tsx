"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminService,
  type PurchaseIntentResponse,
} from "@/features/admin/services/admin-service";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AdminIntentionsPage() {
  const [intentions, setIntentions] = useState<PurchaseIntentResponse[]>([]);
  const [startDate, setStartDate] = useState(daysAgoIso(30));
  const [endDate, setEndDate] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const groupedByProduct = useMemo(() => {
    return intentions.reduce<Record<string, number>>((accumulator, intention) => {
      accumulator[intention.productName] = (accumulator[intention.productName] || 0) + 1;
      return accumulator;
    }, {});
  }, [intentions]);

  const fetchIntentions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setIntentions(await adminService.getPurchaseIntentions(startDate, endDate));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar intenciones");
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void fetchIntentions();
  }, [fetchIntentions]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Intenciones por producto</h1>
          <p className="mt-2 text-sm text-slate-500">
            Clientes que visitaron productos estando autenticados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={fetchIntentions}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-500">Error: {error}</div>}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {Object.entries(groupedByProduct).map(([productName, count]) => (
          <div key={productName} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{productName}</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">{count}</p>
            <p className="text-xs text-slate-500">intenciones</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500">Cargando intenciones...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {intentions.map((intention) => (
                <tr key={intention.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {intention.productName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{intention.customerName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{intention.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(intention.viewedAt).toLocaleString("es-PE")}
                  </td>
                </tr>
              ))}
              {intentions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                    No hay intenciones en este rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
