export function formatAmount(v: string | number): string {
  return `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

/** "5 Jan" — day + abbreviated month, no year */
export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/** "5 Jan 2025" — day + abbreviated month + year */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "5 January 2025" — day + full month + year */
export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
