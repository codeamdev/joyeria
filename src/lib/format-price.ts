export function formatPrice(value: string | number, currency: string = "COP") {
  const amount = typeof value === "string" ? Number(value) : value;
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("es-CO")} ${currency}`;
  }
}
