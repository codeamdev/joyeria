export function buildWhatsAppUrl(rawNumber: string | null | undefined, message: string): string | null {
  if (!rawNumber) return null;
  const digits = rawNumber.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
