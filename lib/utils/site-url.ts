export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getEmailConfirmationRedirectUrl(): string {
  const next = encodeURIComponent("/signup/email-confirmed");
  return `${getSiteUrl()}/auth/callback?next=${next}`;
}
