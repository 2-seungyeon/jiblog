import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { syncPrismaUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

function buildConfirmEmailErrorRedirect(origin: string, message?: string | null): NextResponse {
  const params = new URLSearchParams({ status: "error" });

  if (message) {
    params.set("message", message);
  }

  return NextResponse.redirect(`${origin}/signup/confirm-email?${params.toString()}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextPath = searchParams.get("next") ?? "/signup/email-confirmed";
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return buildConfirmEmailErrorRedirect(origin, errorDescription);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return buildConfirmEmailErrorRedirect(origin, error.message);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      return buildConfirmEmailErrorRedirect(origin, error.message);
    }
  } else {
    return buildConfirmEmailErrorRedirect(origin);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const metadataName =
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : undefined;

    await syncPrismaUser(user.id, user.email, {
      name: metadataName,
      emailVerified: !!user.email_confirmed_at,
    });
  }

  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/signup/email-confirmed";
  return NextResponse.redirect(`${origin}${safeNextPath}`);
}
