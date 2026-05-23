const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateReferralCode(): string {
  return Array.from(
    { length: 8 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}

export function referralUrl(code: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/ref/${code}`;
}
