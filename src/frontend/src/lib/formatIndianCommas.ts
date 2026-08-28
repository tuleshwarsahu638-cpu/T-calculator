/**
 * Formats a number string using the Indian numbering system:
 * thousands, then lakhs (2 digits), then crores (2 digits) —
 * e.g. 1234567 -> "12,34,567", 100000 -> "1,00,000".
 * Leaves the decimal part untouched. Non-numeric strings pass through.
 */
export function formatIndianCommas(value: string): string {
  if (!value || value === "Error") return value;
  if (/[eE]/.test(value)) return value; // leave scientific notation untouched

  const isNegative = value.startsWith("-");
  const clean = isNegative ? value.slice(1) : value;
  const [intPart, ...rest] = clean.split(".");

  if (!/^\d+$/.test(intPart)) return value;

  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = `${grouped},${last3}`;
  }

  const decimalPart = rest.length ? `.${rest.join(".")}` : "";
  return `${isNegative ? "-" : ""}${formatted}${decimalPart}`;
}
