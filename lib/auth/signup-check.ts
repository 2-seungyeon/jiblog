import "server-only";

import { syncPrismaUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { SignUpResult } from "@/lib/types/auth";
import {
  AUTH_MESSAGES,
  isEmailNotConfirmedError,
} from "@/lib/utils/auth-validation";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true },
  });
}

export async function checkExistingEmailSignup(
  email: string,
  password: string,
): Promise<SignUpResult | null> {
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return null;
  }

  if (existingUser.emailVerified) {
    return {
      success: false,
      errors: { email: AUTH_MESSAGES.signupEmailExistsVerified },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (isEmailNotConfirmedError(error)) {
      return {
        success: false,
        errors: { email: AUTH_MESSAGES.signupEmailExistsPending },
      };
    }

    return {
      success: false,
      errors: { email: AUTH_MESSAGES.signupEmailExistsPending },
    };
  }

  if (data.user?.email) {
    const metadataName =
      typeof data.user.user_metadata?.name === "string"
        ? data.user.user_metadata.name
        : undefined;

    await syncPrismaUser(data.user.id, data.user.email, {
      name: metadataName,
      emailVerified: true,
    });
  }

  await supabase.auth.signOut();

  return {
    success: false,
    errors: { email: AUTH_MESSAGES.signupEmailExistsVerified },
  };
}
