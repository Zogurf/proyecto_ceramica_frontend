"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService, type CategoryIntentAnalyticsResponse } from "@/features/admin/services/admin-service";

const iso = (days = 0) => { const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString().slice(0, 10); };

export default function AdminIntentionsPage() {
  const [data, setData] = useState<CategoryIntentAnalyticsResponse[]>([]);
  const [startDate, setStartDate] = useState(iso(30));
  const [endDate, setEndDate] = useState(iso());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); setData(await adminService.getCategoryIntentions(startDate, endDate)); } catch (e) { setError(e instanceof Error ? e.message : "Error al cargar análisis"); } finally { setLoading(false); } }, [startDate, endDate]);
  useEffect(() => { void load(); }, [load]);

  return <div>
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h1 className="text-3xl font-bold">Interés por categoría</h1><p className="mt-2 text-sm text-slate-500">Analiza vistas, carrito y favoritos para descubrir qué productos impulsan cada categoría.</p></div><div className="flex gap-2"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-lg border px-3 py-2"/><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-lg border px-3 py-2"/><button onClick={load} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Filtrar</button></div></div>
    {error && <div className="mb-4 text-red-600">{error}</div>}
    {loading ? <p className="text-slate-500">Analizando interacciones...</p> : <div className="grid gap-5 lg:grid-cols-2">{data.map(category => <article key={category.categoryId} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex justify-between"><div><h2 className="text-xl font-bold">{category.categoryName}</h2><p className="text-sm text-slate-500">{category.uniqueCustomers} clientes interesados</p></div><strong className="text-2xl text-blue-700">{category.interactions}</strong></div><div className="mt-5 space-y-2">{category.topProducts.map((product, index) => <div key={product.productId} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>{index + 1}. {product.productName}</span><strong>{product.interactions}</strong></div>)}</div></article>)}{data.length === 0 && <p className="text-slate-500">No hay interacciones en este rango.</p>}</div>}
  </div>;
}
