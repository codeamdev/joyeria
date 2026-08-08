"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldWrapper, Input } from "@/components/ui/field";
import { ROLE_LABELS, ROLE_VALUES } from "@/lib/validation/admin-user";
import {
  createAdminUser,
  resetAdminUserPassword,
  updateAdminUser,
  type UserFormState,
} from "./actions";

const initialState: UserFormState = {};

function useCloseOnSuccess(state: UserFormState, setOpen: (open: boolean) => void) {
  const submittedRef = useRef(false);
  useEffect(() => {
    if (submittedRef.current && !state.error && !state.fieldErrors) {
      submittedRef.current = false;
      setOpen(false);
    }
  }, [state, setOpen]);
  return submittedRef;
}

export function CreateUserDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createAdminUser, initialState);
  const submittedRef = useCloseOnSuccess(state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title="Nuevo usuario administrador">
        <form
          action={(formData) => {
            submittedRef.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <FieldWrapper label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
            <Input id="name" name="name" required />
          </FieldWrapper>
          <FieldWrapper label="Correo" htmlFor="email" error={state.fieldErrors?.email}>
            <Input id="email" name="email" type="email" required />
          </FieldWrapper>
          <FieldWrapper
            label="Contraseña temporal"
            htmlFor="password"
            error={state.fieldErrors?.password}
            hint="Mínimo 10 caracteres. El usuario podrá cambiarla luego."
          >
            <Input id="password" name="password" type="text" required minLength={10} />
          </FieldWrapper>
          <FieldWrapper label="Rol" htmlFor="role">
            <select
              id="role"
              name="role"
              defaultValue="EDITOR"
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            >
              {ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </FieldWrapper>
          {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando…" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type UserRow = { id: string; name: string; role: "ADMIN" | "EDITOR"; isActive: boolean };

export function EditUserDialog({ user, trigger }: { user: UserRow; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const action = updateAdminUser.bind(null, user.id);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const submittedRef = useCloseOnSuccess(state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={`Editar “${user.name}”`}>
        <form
          action={(formData) => {
            submittedRef.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <FieldWrapper label="Nombre" htmlFor={`name-${user.id}`} error={state.fieldErrors?.name}>
            <Input id={`name-${user.id}`} name="name" defaultValue={user.name} required />
          </FieldWrapper>
          <FieldWrapper label="Rol" htmlFor={`role-${user.id}`}>
            <select
              id={`role-${user.id}`}
              name="role"
              defaultValue={user.role}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            >
              {ROLE_VALUES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </FieldWrapper>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name="isActive" value="true" defaultChecked={user.isActive} />
            <input type="hidden" name="isActive" value="false" />
            Cuenta activa
          </label>
          {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ResetPasswordDialog({ userId, userName, trigger }: { userId: string; userName: string; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const action = resetAdminUserPassword.bind(null, userId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const submittedRef = useCloseOnSuccess(state, setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={`Restablecer contraseña de “${userName}”`}>
        <form
          action={(formData) => {
            submittedRef.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <FieldWrapper
            label="Nueva contraseña"
            htmlFor="password"
            error={state.fieldErrors?.password}
            hint="Mínimo 10 caracteres"
          >
            <Input id="password" name="password" type="text" required minLength={10} />
          </FieldWrapper>
          {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Restablecer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
