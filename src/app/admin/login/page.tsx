import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl tracking-wide text-ink">Joyería y Platería AJ</p>
          <p className="mt-1 text-sm text-ink/60">Panel de administración</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
