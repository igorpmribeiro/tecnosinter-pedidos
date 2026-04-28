export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const numberFmt = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return dateFmt.format(date);
}

export const UNITS = [
  { value: "Unid.", label: "Unidade" },
  { value: "MT", label: "Metro" },
  { value: "CM", label: "Centímetro" },
  { value: "KG", label: "Quilograma" },
  { value: "L", label: "Litro" },
  { value: "M²", label: "Metro quadrado" },
  { value: "M³", label: "Metro cúbico" },
  { value: "PC", label: "Peça" },
] as const;
