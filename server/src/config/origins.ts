export const parseOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
