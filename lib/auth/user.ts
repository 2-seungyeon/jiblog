import "server-only";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export function getDisplayNameFromEmail(email: string): string {
  return email.split("@")[0] ?? email;
}

export function getDisplayName(user: Pick<AppUser, "name" | "email">): string {
  const trimmedName = user.name.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return getDisplayNameFromEmail(user.email);
}

export async function syncPrismaUser(
  id: string,
  email: string,
  options?: { name?: string; emailVerified?: boolean },
): Promise<AppUser> {
  const name = options?.name?.trim();

  const user = await prisma.user.upsert({
    where: { id },
    create: {
      id,
      email,
      name: name ?? "",
      emailVerified: options?.emailVerified ?? false,
    },
    update: {
      email,
      ...(name ? { name } : {}),
      ...(options?.emailVerified !== undefined
        ? { emailVerified: options.emailVerified }
        : {}),
    },
    select: { id: true, email: true, name: true },
  });

  return user;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return syncPrismaUser(user.id, user.email, {
    emailVerified: !!user.email_confirmed_at,
  });
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError();
  }

  return user;
}
