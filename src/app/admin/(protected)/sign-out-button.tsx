"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="mt-3 w-full rounded-md px-3 py-2 text-left text-sm text-ink/75 hover:bg-surface hover:text-ink"
    >
      Cerrar sesión
    </button>
  );
}
