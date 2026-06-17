"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  adminService,
  type AdminProductResponse,
  type CampaignResponse,
} from "@/features/admin/services/admin-service";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AdminCampaignsPage() {
  const [products, setProducts] = useState<AdminProductResponse[]>([]);
  const [productId, setProductId] = useState("");
  const [theme, setTheme] = useState("Navidad artesanal");
  const [offerText, setOfferText] = useState("15% de descuento por tiempo limitado");
  const [subject, setSubject] = useState("");
  const [startDate, setStartDate] = useState(daysAgoIso(7));
  const [endDate, setEndDate] = useState(todayIso());
  const [response, setResponse] = useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await adminService.getProducts();
      setProducts(data);
      setProductId(data[0]?.id.toString() ?? "");
    };

    void loadProducts();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Selecciona un producto");
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.sendCampaign({
        productId: Number(productId),
        theme,
        offerText,
        subject: subject || undefined,
        startDate,
        endDate,
      });
      setResponse(result);
      toast.success(`Campana enviada a ${result.recipients} clientes`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar la campana");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Crear campana</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gemini genera el cuerpo HTML y el sistema personaliza cada correo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Producto
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Tematica
            <input
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              placeholder="Navidad, Pascua, Fiestas Patrias..."
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Oferta
            <input
              value={offerText}
              onChange={(event) => setOfferText(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              placeholder="20% de descuento hasta el domingo"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Asunto opcional
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              placeholder="Oferta especial para ti"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Desde
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Hasta
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generando y enviando..." : "Enviar campana"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Vista previa generada</h2>
        {response ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                <strong>Asunto:</strong> {response.subject}
              </p>
              <p>
                <strong>Destinatarios:</strong> {response.recipients}
              </p>
            </div>
            <iframe
              title="Vista previa de campana"
              srcDoc={response.htmlPreview}
              className="h-[560px] w-full rounded-lg border border-slate-200 bg-white"
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Cuando envies una campana, aqui veras el HTML base generado por Gemini.
          </p>
        )}
      </section>
    </div>
  );
}
