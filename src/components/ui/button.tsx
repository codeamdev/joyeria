import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-gold",
  secondary: "border border-ink/20 text-ink hover:bg-surface",
  ghost: "text-ink/70 hover:bg-surface hover:text-ink",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
      VARIANT_CLASSES[variant],
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
