"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { adminService, type AdminOrderResponse } from "@/features/admin/services/admin-service";

function fulfillmentLabel(status: string) {
  return status === "SHIPPED" ? "Enviado" : "Pendiente de envio";
}

function orderMessage(order: AdminOrderResponse) {
  const products = order.items
    .map((item) => `${item.productName} x${item.quantity}`)
    .join(", ");
  return `Hola ${order.customerName}, te contactamos de El mundo de Mery sobre tu pedido #${order.id} (${products}), por un total de S/ ${order.total.toFixed(2)}. Estado: ${order.status === "PAID" ? "pagado" : "pendiente de pago"} y ${fulfillmentLabel(order.fulfillmentStatus).toLowerCase()}.`;
}

function gmailUrl(order: AdminOrderResponse) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: order.customerEmail,
    su: `Información sobre tu pedido #${order.id} - El mundo de Mery`,
    body: orderMessage(order),
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function whatsappUrl(order: AdminOrderResponse) {
  let phone = (order.customerPhone || "").replace(/\D/g, "");
  if (phone.startsWith("00")) phone = phone.slice(2);
  if (phone.length === 9) phone = `51${phone}`;
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(orderMessage(order))}` : "";
}

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

  const handleFulfillmentChange = async (orderId: number, fulfillmentStatus: string) => {
    try {
      const updated = await adminService.updateOrderFulfillment(orderId, fulfillmentStatus);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === updated.id ? updated : order))
      );
      toast.success("Estado de envio actualizado");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el estado");
    }
  };

  if (loading) return <div className="text-slate-500">Cargando pedidos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Ventas y pedidos</h1>
        <p className="mt-2 text-sm text-slate-500">
          Revisa pagos y actualiza el estado de envio de cada compra.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pedido #{order.id}</h2>
                <p className="text-sm text-slate-500">{order.customerName}</p>
                <p className="text-sm text-slate-500">{order.customerEmail}</p>
                <p className="text-sm text-slate-500">Celular: {order.customerPhone || "No registrado"}</p>
                <p className="mt-2 text-sm text-slate-600">{order.shippingAddress}</p>
                {order.shippingReference && (
                  <p className="text-xs text-slate-400">{order.shippingReference}</p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(order.registerDate).toLocaleString("es-PE")}
                </p>
              </div>
              <div className="min-w-52 text-left md:text-right">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  {order.status === "PAID" ? "Pagado" : "Pendiente de pago"}
                </span>
                <p className="mt-2 text-xl font-bold text-slate-900">S/{order.total.toFixed(2)}</p>
                <label className="mt-3 grid gap-1 text-xs font-semibold text-slate-500 md:text-left">
                  Estado de envio
                  <select
                    value={order.fulfillmentStatus}
                    onChange={(event) => handleFulfillmentChange(order.id, event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
                  >
                    <option value="PENDING_SHIPMENT">Pendiente de envio</option>
                    <option value="SHIPPED">Enviado</option>
                  </select>
                </label>
                <p className="mt-2 text-xs text-slate-500">{fulfillmentLabel(order.fulfillmentStatus)}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={gmailUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    title={`Escribir a ${order.customerEmail}`}
                  >
                    <SiGmail className="text-lg" aria-hidden="true" />
                    Gmail
                  </a>
                  {whatsappUrl(order) ? (
                    <a
                      href={whatsappUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                      title={`Escribir al ${order.customerPhone}`}
                    >
                      <FaWhatsapp className="text-lg" aria-hidden="true" />
                      WhatsApp
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400"
                      title="Este pedido no tiene celular registrado"
                    >
                      <FaWhatsapp className="text-lg" aria-hidden="true" />
                      Sin número
                    </button>
                  )}
                </div>
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
