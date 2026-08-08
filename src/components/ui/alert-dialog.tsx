"use client";

import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;

export function AlertDialogContent({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "danger",
  className,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "primary";
  className?: string;
}) {
  return (
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
      <RadixAlertDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-ivory p-6 shadow-xl",
          className,
        )}
      >
        <RadixAlertDialog.Title className="font-serif text-lg text-ink">
          {title}
        </RadixAlertDialog.Title>
        {description ? (
          <RadixAlertDialog.Description className="mt-2 text-sm text-ink/60">
            {description}
          </RadixAlertDialog.Description>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <RadixAlertDialog.Cancel asChild>
            <Button variant="secondary">{cancelLabel}</Button>
          </RadixAlertDialog.Cancel>
          <RadixAlertDialog.Action asChild>
            <Button variant={variant} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </RadixAlertDialog.Action>
        </div>
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  );
}
