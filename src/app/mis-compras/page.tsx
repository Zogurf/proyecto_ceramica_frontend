"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FooterPublic from "@/components/shared/footer-public";
import { getMyOrders, type OrderResponse } from "@/features/checkout/checkout-service";

function fulfillmentLabel(status: string) {
  return status === "SHIPPED" ? "Enviado" : "Pendiente de envio";
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrders(await getMyOrders());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar tus compras");
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  return (
    <>
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 lg:py-14">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[--muted]">
            Cuenta
          </span>
          <h1 className="mt-2 font-display text-5xl text-[--foreground]">Mis compras</h1>
        </div>

        {loading ? (
          <p className="text-[--muted]">Cargando compras...</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[--border-soft] bg-white/72 p-8 text-center text-[--muted]">
            Aun no tienes compras registradas.
          </div>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/mis-compras/${order.id}`}
                className="block rounded-[1.5rem] border border-[--border-soft] bg-white/80 p-5 shadow-[0_18px_45px_rgba(77,50,36,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(77,50,36,0.12)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[--foreground]">Pedido #{order.id}</h2>
                    <p className="mt-1 text-sm text-[--muted]">
                      {new Date(order.registerDate).toLocaleString("es-PE")}
                    </p>
                    <p className="mt-2 text-sm text-[--muted]">
                      {fulfillmentLabel(order.fulfillmentStatus)}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xl font-bold text-[--foreground]">S/{order.total.toFixed(2)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-green-700">
                      {order.status === "PAID" ? "Pagado" : "Pendiente de pago"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
      <FooterPublic />
    </>
  );
}
