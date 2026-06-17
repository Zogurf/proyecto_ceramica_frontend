"use client";

import { useEffect, useState } from "react";
import { adminService, type AdminOrderResponse } from "@/features/admin/services/admin-service";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setOrders(await adminService.getOrders());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  if (loading) return <div className="text-slate-500">Cargando pedidos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Ventas y pedidos</h1>
        <p className="mt-2 text-sm text-slate-500">Pagos realizados y pedidos pendientes.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pedido #{order.id}</h2>
                <p className="text-sm text-slate-500">{order.customerName}</p>
                <p className="text-xs text-slate-400">
                  {new Date(order.registerDate).toLocaleString("es-PE")}
                </p>
              </div>
              <div className="text-left md:text-right">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {order.status}
                </span>
                <p className="mt-2 text-xl font-bold text-slate-900">S/{order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={`${order.id}-${item.productId}-${item.sizeName}`}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.sizeName || "Sin tamano"} {item.sizeDimension ? `(${item.sizeDimension})` : ""}
                      </td>
                      <td className="px-4 py-3 text-slate-500">x{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        S/{item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}

        {orders.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No hay pedidos registrados.
          </div>
        )}
      </div>
    </div>
  );
}
