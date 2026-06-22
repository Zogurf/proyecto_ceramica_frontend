"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import FooterPublic from "@/components/shared/footer-public";
import Navbar from "@/components/shared/navbar-public";
import { getFavorites, removeFavorite, type FavoriteProduct } from "@/features/products/services/favorite-service";
import { getProductImageSrc } from "@/lib/images";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteProduct[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { getFavorites().then(setItems).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const remove = async (id: number) => { await removeFavorite(id); setItems(current => current.filter(i => i.productId !== id)); };
  return <><Navbar/><main className="mx-auto max-w-6xl px-5 py-12"><span className="text-xs font-semibold uppercase tracking-[.24em] text-[--muted]">Tu colección</span><h1 className="mt-2 font-display text-5xl">Favoritos</h1>{loading ? <p className="mt-8 text-[--muted]">Cargando...</p> : error ? <p className="mt-8 text-red-600">Inicia sesión para guardar y consultar favoritos.</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.productId} className="rounded-3xl border border-[--border-soft] bg-white p-4"><Link href={`/producto/${item.productId}`}><div className="relative aspect-square overflow-hidden rounded-2xl"><Image src={getProductImageSrc(item.imageUrl)} alt={item.name} fill className="object-cover"/></div><h2 className="mt-4 font-display text-3xl">{item.name}</h2><p className="text-sm text-[--muted]">{item.categoryName}</p><p className="mt-2 font-bold">S/ {Number(item.price).toFixed(2)}</p></Link><button onClick={() => remove(item.productId)} className="mt-4 text-sm font-semibold text-red-600">Quitar de favoritos</button></article>)}{items.length === 0 && <p className="text-[--muted]">Aún no guardaste productos.</p>}</div>}</main><FooterPublic/></>;
}
