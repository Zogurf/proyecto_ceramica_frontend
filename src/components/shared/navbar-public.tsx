"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "@/features/auth/components/auth-modal";
import { useCart } from "@/features/cart/cart-context";
import { AUTH_CHANGED_EVENT, notifyAuthChanged } from "@/features/auth/hooks/useAuth";
import type { AuthUser } from "@/features/auth/types";

export default function Navbar() {
  const { totalItems, lastAddedAt } = useCart();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const syncUserFromStorage = () => {
      const storedUser = window.localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        window.localStorage.removeItem("user");
        window.localStorage.removeItem("token");
        setUser(null);
      }
    };

    syncUserFromStorage();
    window.addEventListener("storage", syncUserFromStorage);
    window.addEventListener(AUTH_CHANGED_EVENT, syncUserFromStorage);

    return () => {
      window.removeEventListener("storage", syncUserFromStorage);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUserFromStorage);
    };
  }, []);

  const handleLogin = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    notifyAuthChanged();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    notifyAuthChanged();
    setShowDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[rgba(120,87,66,0.1)] bg-[rgba(251,246,241,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/" className="space-y-1">
            <p className="font-display text-3xl leading-none text-[--foreground]">
              El mundo de Mery
            </p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[--muted]">
              Ceramica decorativa
            </p>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[--muted] md:flex">
            <Link href="/#colecciones" className="transition hover:text-[--foreground]">
              Colecciones
            </Link>
            <Link href="/#destacados" className="transition hover:text-[--foreground]">
              Destacados
            </Link>
            <Link href="/#proceso" className="transition hover:text-[--foreground]">
              Proceso
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              key={lastAddedAt || "cart-button"}
              href="/carrito"
              className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-[--border-soft] bg-white/60 px-4 py-2 text-sm font-semibold text-[--foreground] hover:border-[--accent] ${
                lastAddedAt ? "cart-bump" : ""
              }`}
              aria-label="Ver carrito"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="hidden md:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[--accent-strong] px-1 text-[11px] font-bold text-black">
                  {totalItems}
                </span>
              )}
            </Link>

            {!user ? (
              <button
                onClick={() => setShowModal(true)}
                className="button-primary cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-black"
              >
                Iniciar sesion
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="cursor-pointer rounded-full border border-[--border-soft] bg-white px-4 py-2 text-sm font-semibold text-[--foreground]"
                >
                  {user.name}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 min-w-44 rounded-2xl border border-[--border-soft] bg-white p-2 shadow-[0_20px_50px_rgba(51,31,21,0.14)]">
                    <Link
                      href="/favoritos"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[--foreground] transition hover:bg-[#fffaf7]"
                    >
                      Favoritos
                    </Link>
                    <Link
                      href="/mis-compras"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[--foreground] transition hover:bg-[#fffaf7]"
                    >
                      Mis compras
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full cursor-pointer rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {showModal && <AuthModal onClose={() => setShowModal(false)} onLogin={handleLogin} />}
    </>
  );
}
