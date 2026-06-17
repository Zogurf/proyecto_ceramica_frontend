"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { registerUser } from "@/features/auth/services/auth-service";
import { findPersonByDni } from "@/features/auth/services/persona-service";
import { PasswordInput } from "@/features/auth/components/password-input";

type Props = {
  onRegister: () => void;
};

export default function RegisterForm({ onRegister }: Props) {
  const [dni, setDni] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [motherLastName, setMotherLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    dni: "",
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingDni, setLoadingDni] = useState(false);

  const isValidDni = (value: string) => /^\d{8}$/.test(value);

  const resetPersonData = () => {
    setFirstName("");
    setLastName("");
    setMotherLastName("");
    setBirthDate("");
  };

  const handleSearchDni = async () => {
    if (!isValidDni(dni)) {
      const message = "El DNI debe tener 8 dígitos";
      setError(message);
      toast.error(message);
      resetPersonData();
      return;
    }

    setLoadingDni(true);
    setError("");

    try {
      const data = await findPersonByDni(dni);
      setFirstName(data.firstName ?? data.nombres ?? "");
      setLastName(data.lastName ?? data.apellidoPaterno ?? "");
      setMotherLastName(data.motherLastName ?? data.apellidoMaterno ?? "");
      setBirthDate(data.birthDate ?? data.fechaNacimiento ?? "");
      toast.success("Datos del DNI cargados");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al consultar el DNI";
      setError(message);
      toast.error(message);
      resetPersonData();
    } finally {
      setLoadingDni(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser({
        dni,
        firstName,
        lastName,
        motherLastName,
        birthDate,
        email,
        password,
      });

      toast.success("¡Cuenta creada correctamente!");
      onRegister();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <input
            placeholder="DNI"
            value={dni}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 8);
              setDni(val);
              resetPersonData();

              if (val.length > 0 && val.length < 8) {
                setFieldErrors((prev) => ({ ...prev, dni: "El DNI debe tener 8 dígitos." }));
              } else {
                setFieldErrors((prev) => ({ ...prev, dni: "", general: "" }));
              }
            }}
            className={`flex-1 rounded-2xl border bg-[#fffaf7] px-4 py-3 text-[--foreground] outline-none transition placeholder:text-[#8b7667] focus:border-[--accent] focus:bg-white ${fieldErrors.dni ? "border-red-500" : "border-[rgba(78,54,39,0.14)]"}`}
            required
          />
          <button
            type="button"
            onClick={handleSearchDni}
            className="cursor-pointer rounded-2xl border border-[rgba(78,54,39,0.14)] bg-white px-4 py-3 text-sm font-semibold text-[--foreground] transition hover:border-[--accent] hover:text-[--accent]"
            disabled={loadingDni}
          >
            {loadingDni ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {fieldErrors.dni && <span className="text-xs font-medium text-red-500 pl-2">{fieldErrors.dni}</span>}
      </div>
      <input
        placeholder="Nombres"
        value={firstName}
        readOnly
        className="rounded-2xl border border-[rgba(78,54,39,0.14)] bg-[#f4eee8] px-4 py-3 text-[--foreground] outline-none"
      />
      <input
        placeholder="Apellido paterno"
        value={lastName}
        readOnly
        className="rounded-2xl border border-[rgba(78,54,39,0.14)] bg-[#f4eee8] px-4 py-3 text-[--foreground] outline-none"
      />
      <input
        placeholder="Apellido materno"
        value={motherLastName}
        readOnly
        className="rounded-2xl border border-[rgba(78,54,39,0.14)] bg-[#f4eee8] px-4 py-3 text-[--foreground] outline-none"
      />
      <input
        placeholder="Fecha de nacimiento"
        value={birthDate}
        readOnly
        className="rounded-2xl border border-[rgba(78,54,39,0.14)] bg-[#f4eee8] px-4 py-3 text-[--foreground] outline-none"
      />
      <div className="flex flex-col gap-1">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (val.length > 0 && !emailRegex.test(val)) {
              setFieldErrors((prev) => ({ ...prev, email: "Formato de correo inválido." }));
            } else {
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          className={`rounded-2xl border bg-[#fffaf7] px-4 py-3 text-[--foreground] outline-none transition placeholder:text-[#8b7667] focus:border-[--accent] focus:bg-white ${fieldErrors.email ? "border-red-500" : "border-[rgba(78,54,39,0.14)]"}`}
          required
        />
        {fieldErrors.email && <span className="text-xs font-medium text-red-500 pl-2">{fieldErrors.email}</span>}
      </div>
      <div className="flex flex-col gap-1">
        <PasswordInput
          placeholder="Contraseña"
          autoComplete="off"
          value={password}
          onChange={(e) => {
            const val = e.target.value;
            setPassword(val);

            if (val.length > 0 && val.length < 6) {
              setFieldErrors((prev) => ({ ...prev, password: "Debe tener al menos 6 caracteres." }));
            } else {
              setFieldErrors((prev) => ({ ...prev, password: "" }));
            }
          }}
          required
          className={fieldErrors.password ? "border-red-500" : "border-[rgba(78,54,39,0.14)]"}
        />
        {fieldErrors.password && <span className="text-xs font-medium text-red-500 pl-2">{fieldErrors.password}</span>}
      </div>
      <button
        type="submit"
        className="mt-2 cursor-pointer rounded-full border border-[rgba(67,37,22,0.35)] bg-[--foreground] p-3 font-semibold text-black-500 shadow-[0_14px_28px_rgba(67,37,22,0.18)] transition hover:bg-[--accent-strong] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Crear cuenta"}
      </button>
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
