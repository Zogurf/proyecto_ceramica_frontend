"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FooterPublic from "@/components/shared/footer-public";
import { getMyOrder, retryOrderPayment, type OrderResponse } from "@/features/checkout/checkout-service";
import { getProductImageSrc } from "@/lib/images";

function fulfillmentLabel(status: string) {
  return status === "SHIPPED"
    ? "Tus productos ya fueron enviados"
    : "Pendiente: aun no se han enviado tus productos";
}

export default function MyOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!order) return;
    try {
      setPaying(true);
      const session = await retryOrderPayment(order.id);
      window.location.href = session.checkoutUrl;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo reanudar el pago");
      setPaying(false);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setOrder(await getMyOrder(Number(params.id)));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la compra");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [params.id]);

  return (
    <>
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8 lg:py-14">
        <Link href="/mis-compras" className="text-sm font-semibold text-[--muted] hover:text-[--foreground]">
          Volver a mis compras
        </Link>

        {loading ? (
          <p className="mt-8 text-[--muted]">Cargando detalle...</p>
        ) : error || !order ? (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
            {error || "Compra no disponible"}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[--muted]">
                  Pedido #{order.id}
                </span>
                <h1 className="mt-2 font-display text-5xl text-[--foreground]">
                  Detalle de compra
                </h1>
              </div>

              {order.items.map((item) => (
                <article
                  key={`${order.id}-${item.productId}-${item.sizeName}`}
                  className="grid gap-4 rounded-[1.5rem] border border-[--border-soft] bg-white/80 p-4 shadow-[0_18px_45px_rgba(77,50,36,0.08)] sm:grid-cols-[96px_1fr]"
                >
                  <div className="image-card overflow-hidden rounded-[1rem]">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={getProductImageSrc(item.imageUrl)}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h2 className="font-display text-3xl text-[--foreground]">{item.productName}</h2>
                      <p className="mt-1 text-sm text-[--muted]">
                        {item.sizeName || "Sin tamano"} {item.sizeDimension ? `(${item.sizeDimension})` : ""}
                      </p>
                      <p className="mt-2 text-sm text-[--muted]">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="text-lg font-bold text-[--foreground]">S/{item.subtotal.toFixed(2)}</p>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-[1.5rem] border border-[--border-soft] bg-white p-6 shadow-[0_18px_45px_rgba(77,50,36,0.08)]">
              <h2 className="text-xl font-bold text-[--foreground]">Estado</h2>
              <div className="mt-4 space-y-3 text-sm text-[--muted]">
                <p>
                  Pago:{" "}
                  <span className="font-semibold text-green-700">
                    {order.status === "PAID" ? "Pagado" : "Pendiente"}
                  </span>
                </p>
                <p>
                  Envio:{" "}
                  <span className="font-semibold text-[--foreground]">
                    {fulfillmentLabel(order.fulfillmentStatus)}
                  </span>
                </p>
                <p>Fecha: {new Date(order.registerDate).toLocaleString("es-PE")}</p>
              </div>

              <div className="mt-5 border-y border-[--border-soft] py-5 text-sm text-[--muted]">
                <p className="font-semibold text-[--foreground]">Entrega</p>
                <p className="mt-2">{order.shippingAddress}</p>
                <p className="mt-1">Celular: {order.customerPhone || "No registrado"}</p>
                {order.shippingReference && <p className="mt-1 text-xs">{order.shippingReference}</p>}
              </div>

              <div className="mt-5 flex justify-between text-lg font-bold text-[--foreground]">
                <span>Total</span>
                <span>S/{order.total.toFixed(2)}</span>
              </div>
              {order.status === "PENDING" && (
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  className="button-primary mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {paying ? "Abriendo pago..." : "Completar pago"}
                </button>
              )}
            </aside>
          </div>
        )}
      </main>
      <FooterPublic />
    </>
  );
}
