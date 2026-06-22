"use client";

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { adminService, type DashboardResponse, type MetricPoint } from "@/features/admin/services/admin-service";
import DashboardCard from "../components/DashboardCard";
import DashboardChartCard from "../components/DashboardChartCard";

type TimeFilter = "today" | "weekly" | "monthly";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [filter, setFilter] = useState<TimeFilter>("monthly");
  const [error, setError] = useState("");
  const revenueRef = useRef<HTMLCanvasElement>(null);
  const inventoryRef = useRef<HTMLCanvasElement>(null);
  const revenueChart = useRef<Chart | null>(null);
  const inventoryChart = useRef<Chart | null>(null);

  useEffect(() => { adminService.getDashboard().then(setData).catch((e) => setError(e.message)); }, []);

  useEffect(() => {
    if (!data || !revenueRef.current || !inventoryRef.current) return;
    const series: Record<TimeFilter, MetricPoint[]> = {
      today: data.revenueToday, weekly: data.revenueWeekly, monthly: data.revenueMonthly,
    };
    revenueChart.current?.destroy(); inventoryChart.current?.destroy();
    revenueChart.current = new Chart(revenueRef.current, {
      type: "line", data: { labels: series[filter].map(p => p.label), datasets: [{
        data: series[filter].map(p => p.value), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,.08)", fill: true, tension: .35,
      }]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
    inventoryChart.current = new Chart(inventoryRef.current, {
      type: "doughnut", data: { labels: data.inventoryByCategory.map(p => p.label), datasets: [{
        data: data.inventoryByCategory.map(p => p.value), backgroundColor: ["#D9C2AD", "#C8A98D", "#B08968", "#7F5539", "#EDE0D4", "#9C6644"],
      }]}, options: { responsive: true, plugins: { legend: { position: "bottom" } } },
    });
    return () => { revenueChart.current?.destroy(); inventoryChart.current?.destroy(); };
  }, [data, filter]);

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div className="text-slate-500">Cargando métricas reales...</div>;

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-slate-950">Resumen del sistema</h1><p className="mt-1 text-sm text-slate-500">Datos calculados desde pedidos, inventario e interacciones.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <DashboardCard title="Ventas totales" value={`S/ ${data.totalRevenue.toFixed(2)}`} iconType="sales" />
      <DashboardCard title="Usuarios" value={data.userCount} iconType="users" />
      <DashboardCard title="Inventario" value={data.inventoryUnits} iconType="inventory" />
      <DashboardCard title="Pagos pendientes" value={data.pendingOrders} iconType="pending" />
      <DashboardCard title="Stock bajo" value={data.lowStockProducts} iconType="inventory" />
    </div>
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="relative lg:col-span-2">
        <div className="absolute right-6 top-6 z-10 flex rounded-lg bg-slate-100 p-1">
          {(["today", "weekly", "monthly"] as TimeFilter[]).map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-md px-3 py-1 text-xs ${filter === value ? "bg-white font-bold shadow" : "text-slate-500"}`}>{value === "today" ? "Hoy" : value === "weekly" ? "7 días" : "Año"}</button>)}
        </div>
        <DashboardChartCard title="Ingresos" subtitle="Solo pedidos confirmados como pagados"><canvas ref={revenueRef} /></DashboardChartCard>
      </div>
      <DashboardChartCard title="Inventario por categoría" subtitle="Unidades disponibles"><canvas ref={inventoryRef} /></DashboardChartCard>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border bg-white p-5"><h2 className="font-bold">Categorías con mayor interés</h2><div className="mt-4 space-y-3">{data.interactionsByCategory.slice(0, 6).map(p => <div key={p.label} className="flex justify-between border-b pb-2 text-sm"><span>{p.label}</span><strong>{p.value} interacciones</strong></div>)}</div></section>
      <section className="rounded-xl border bg-white p-5"><h2 className="font-bold">Alertas de stock</h2><div className="mt-4 space-y-3">{data.lowStock.map(p => <div key={p.id} className="flex justify-between rounded-lg bg-amber-50 p-3 text-sm"><span>{p.name} · {p.categoryName}</span><strong className="text-amber-700">{p.stock} unidades</strong></div>)}{data.lowStock.length === 0 && <p className="text-sm text-slate-500">No hay productos con stock bajo.</p>}</div></section>
    </div>
  </div>;
}
