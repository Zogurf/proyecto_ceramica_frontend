"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FooterPublic from "@/components/shared/footer-public";
import { useCart } from "@/features/cart/cart-context";
import { createCheckoutSession } from "@/features/checkout/checkout-service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getProductImageSrc } from "@/lib/images";

export default function CartPage() {
  const {
    items,
    totalItems,
    totalAmount,
    increaseItem,
    decreaseItem,
    removeItem,
  } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingReference, setShippingReference] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    setCustomerName(user?.name ?? "");
    setCustomerEmail(user?.email ?? "");
  }, [user]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Tu carrito esta vacio");
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim() || !customerPhone.trim()) {
      toast.error("Completa nombre, correo, celular y direccion de entrega");
      return;
    }

    if (!/^[0-9+()\s-]{7,20}$/.test(customerPhone.trim())) {
      toast.error("Ingresa un numero de celular valido");
      return;
    }

    try {
      setLoading(true);
      const response = await createCheckoutSession(items, {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingReference: shippingReference.trim(),
        customerPhone: customerPhone.trim(),
      });
      window.location.href = response.checkoutUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar el pago";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:py-14">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[--muted]">
              Carrito
            </span>
            <h1 className="mt-2 font-display text-5xl text-[--foreground]">
              Detalle de compra
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-[--muted] transition hover:text-[--foreground]"
          >
            Seguir comprando
          </Link>
        </div>

        {items.length === 0 ? (
          <section className="rounded-[2rem] border border-[--border-soft] bg-white/72 p-10 text-center">
            <h2 className="font-display text-4xl text-[--foreground]">Tu carrito esta vacio</h2>
            <p className="mt-3 text-sm text-[--muted]">
              Agrega una pieza desde el catalogo para verla aqui.
            </p>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={`${item.productId}-${item.sizeId}`}
                  className="grid gap-4 rounded-[1.5rem] border border-[--border-soft] bg-white/80 p-4 shadow-[0_18px_45px_rgba(77,50,36,0.08)] sm:grid-cols-[120px_1fr]"
                >
                  <div className="image-card overflow-hidden rounded-[1rem]">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={getProductImageSrc(item.imageUrl)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div>
                      <h2 className="font-display text-3xl text-[--foreground]">{item.name}</h2>
                      <p className="mt-1 text-sm text-[--muted]">
                        {item.sizeName}, {item.sizeDimension}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-[--accent]">
                        S/{item.price.toFixed(2)} por unidad
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <p className="text-lg font-bold text-[--foreground]">
                        S/{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreaseItem(item.productId, item.sizeId)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[--border-soft] bg-[#fffaf7] font-semibold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increaseItem(item.productId, item.sizeId)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[--border-soft] bg-[#fffaf7] font-semibold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.sizeId)}
                        className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-[1.5rem] border border-[--border-soft] bg-white p-6 shadow-[0_18px_45px_rgba(77,50,36,0.08)]">
              <h2 className="text-xl font-bold text-[--foreground]">Resumen</h2>
              <div className="mt-5 space-y-3">
                <label className="grid gap-1 text-sm font-semibold text-[--foreground]">
                  Nombre
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    autoComplete="name"
                    className="rounded-2xl border border-[--border-soft] bg-[#fffaf7] px-4 py-3 font-normal outline-none focus:border-[--accent]"
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-[--foreground]">
                  Correo electronico
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    autoComplete="email"
                    className="rounded-2xl border border-[--border-soft] bg-[#fffaf7] px-4 py-3 font-normal outline-none focus:border-[--accent]"
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-[--foreground]">
                  Celular
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    autoComplete="tel"
                    placeholder="987 654 321"
                    className="rounded-2xl border border-[--border-soft] bg-[#fffaf7] px-4 py-3 font-normal outline-none focus:border-[--accent]"
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-[--foreground]">
                  Direccion
                  <input
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    autoComplete="street-address"
                    placeholder="Av. / Calle / distrito"
                    className="rounded-2xl border border-[--border-soft] bg-[#fffaf7] px-4 py-3 font-normal outline-none focus:border-[--accent]"
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-[--foreground]">
                  Referencia
                  <textarea
                    value={shippingReference}
                    onChange={(event) => setShippingReference(event.target.value)}
                    placeholder="Color de puerta, piso, indicaciones..."
                    className="min-h-24 resize-none rounded-2xl border border-[--border-soft] bg-[#fffaf7] px-4 py-3 font-normal outline-none focus:border-[--accent]"
                  />
                </label>
              </div>
              <div className="mt-5 space-y-3 border-y border-[--border-soft] py-5 text-sm">
                <div className="flex justify-between text-[--muted]">
                  <span>Productos</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-[--muted]">
                  <span>Subtotal</span>
                  <span>S/{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-5 flex justify-between text-lg font-bold text-[--foreground]">
                <span>Total</span>
                <span>S/{totalAmount.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="button-primary mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-[#e3b792] px-6 py-4 text-sm font-semibold text-black hover:bg-[#d9a77d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Preparando pago..." : "Pagar ahora"}
              </button>
            </aside>
          </div>
        )}
      </main>
      <FooterPublic />
    </>
  );
}
