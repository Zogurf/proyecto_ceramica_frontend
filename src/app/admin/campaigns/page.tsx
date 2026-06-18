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
  const [offerText, setOfferText] = useState("15% de descuento por tiempo limitado");
  const [subject, setSubject] = useState("Una oferta especial para ti");
  const [startDate, setStartDate] = useState(daysAgoIso(7));
  const [endDate, setEndDate] = useState(todayIso());
  const [response, setResponse] = useState<CampaignResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const selectedProduct = products.find((product) => product.id.toString() === productId);
  const previewHtml = response?.htmlPreview
    .replaceAll("{{emailTitle}}", response.subject)
    .replaceAll("{{customerName}}", "Cliente de prueba")
    .replaceAll("{{productName}}", selectedProduct?.name ?? "Producto seleccionado")
    .replaceAll("{{offerText}}", offerText)
    .replaceAll("{{price}}", selectedProduct ? `S/ ${Number(selectedProduct.price).toFixed(2)}` : "S/ 0.00");

  const buildCampaignRequest = () => ({
    productId: Number(productId),
    offerText,
    subject: subject.trim(),
    startDate,
    endDate,
  });

  useEffect(() => {
    const loadProducts = async () => {
      const data = await adminService.getProducts();
      setProducts(data);
      setProductId(data[0]?.id.toString() ?? "");
    };

    void loadProducts();
  }, []);

  const handlePreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Selecciona un producto");
      return;
    }

    if (!subject.trim()) {
      toast.error("Ingresa un titulo para la campaña");
      return;
    }

    try {
      setPreviewLoading(true);
      const result = await adminService.previewCampaign(buildCampaignRequest());
      setResponse(result);
      toast.success("Vista previa generada");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo generar la vista previa");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async () => {
    if (!response) {
      toast.error("Genera una vista previa antes de enviar");
      return;
    }

    try {
      setSendLoading(true);
      const result = await adminService.sendCampaign(buildCampaignRequest());
      setResponse(result);
      toast.success(`Campaña enviada a ${result.recipients} clientes`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar la campaña");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Crear campaña</h1>
          <p className="mt-2 text-sm text-slate-500">
            El correo usa el estilo de la tienda y se personaliza para cada cliente.
          </p>
        </div>

        <form onSubmit={handlePreview} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Producto
            <select
              value={productId}
              onChange={(event) => {
                setProductId(event.target.value);
                setResponse(null);
              }}
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
            Titulo
            <input
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setResponse(null);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              placeholder="Una oferta especial para ti"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Oferta
            <input
              value={offerText}
              onChange={(event) => {
                setOfferText(event.target.value);
                setResponse(null);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              placeholder="20% de descuento hasta el domingo"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Desde
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setResponse(null);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Hasta
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setResponse(null);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={previewLoading || sendLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {previewLoading ? "Generando vista previa..." : "Generar vista previa"}
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
              title="Vista previa de campaña"
              srcDoc={previewHtml}
              className="h-[560px] w-full rounded-lg border border-slate-200 bg-white"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sendLoading || previewLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendLoading ? "Enviando campaña..." : `Enviar a ${response.recipients} clientes`}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Genera una vista previa para revisar el correo antes de enviarlo.
          </p>
        )}
      </section>
    </div>
  );
}
