"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import FooterPublic from "@/components/shared/footer-public";
import { confirmCheckoutSession, type OrderResponse } from "@/features/checkout/checkout-service";
import { useCart } from "@/features/cart/cart-context";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId) {
        setError("No se encontro la sesion de pago.");
        setLoading(false);
        return;
      }

      try {
        const response = await confirmCheckoutSession(sessionId);
        setOrder(response);
        clearCart();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "No se pudo confirmar el pago");
      } finally {
        setLoading(false);
      }
    };

    void confirm();
  }, [clearCart, sessionId]);

  return (
    <>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-12">
        <section className="w-full rounded-[2rem] border border-[--border-soft] bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(77,50,36,0.1)]">
          {loading ? (
            <p className="text-[--muted]">Confirmando pago...</p>
          ) : error ? (
            <>
              <h1 className="font-display text-4xl text-red-700">Pago pendiente de confirmar</h1>
              <p className="mt-3 text-sm leading-6 text-[--muted]">{error}</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-5xl text-[--foreground]">Gracias por tu compra</h1>
              <p className="mt-3 text-sm leading-6 text-[--muted]">
                Pedido #{order?.id} registrado por S/{order?.total.toFixed(2)}.
              </p>
            </>
          )}

          <Link
            href="/"
            className="button-primary mt-6 inline-flex rounded-full bg-[#e3b792] px-6 py-3 text-sm font-semibold text-black hover:bg-[#d9a77d]"
          >
            Volver a la tienda
          </Link>
        </section>
      </main>
      <FooterPublic />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-12">
          <section className="w-full rounded-[2rem] border border-[--border-soft] bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(77,50,36,0.1)]">
            <p className="text-[--muted]">Preparando confirmacion...</p>
          </section>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
