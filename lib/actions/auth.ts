"use server";

import { redirect } from "next/navigation";

import { checkExistingEmailSignup } from "@/lib/auth/signup-check";
import { syncPrismaUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormResult, SignUpFieldErrors, SignUpResult } from "@/lib/types/auth";
import {
  AUTH_MESSAGES,
  isDuplicateSignUpUser,
  isEmailNotConfirmedError,
  isValidEmail,
} from "@/lib/utils/auth-validation";

export type { AuthFormResult, SignUpFieldErrors, SignUpResult } from "@/lib/types/auth";

function buildConfirmEmailRedirect(email: string): never {
  const params = new URLSearchParams({ email, status: "new" });
  redirect(`/signup/confirm-email?${params.toString()}`);
}

export async function signUpAction(formData: FormData): Promise<SignUpResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const errors: SignUpFieldErrors = {};

  if (!name) {
    errors.name = "이름을 입력해주세요";
  }

  if (!email) {
    errors.email = "이메일을 입력해주세요";
  } else if (!isValidEmail(email)) {
    errors.email = "올바른 이메일 형식이 아니에요";
  }

  if (!password) {
    errors.password = "비밀번호를 입력해주세요";
  } else if (password.length < 6) {
    errors.password = "비밀번호는 6자 이상이어야 해요";
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = "비밀번호 확인을 입력해주세요";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않아요";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const existingEmailResult = await checkExistingEmailSignup(email, password);

  if (existingEmailResult) {
    return existingEmailResult;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("user already registered")) {
      return {
        success: false,
        errors: { email: AUTH_MESSAGES.signupEmailExistsVerified },
      };
    }

    return { success: false, error: error.message };
  }

  if (isDuplicateSignUpUser(data.user)) {
    return {
      success: false,
      errors: { email: AUTH_MESSAGES.signupEmailExistsPending },
    };
  }

  if (data.user?.email) {
    const emailVerified = !!(data.user.email_confirmed_at || data.session);

    await syncPrismaUser(data.user.id, data.user.email, {
      name,
      emailVerified,
    });
  }

  if (data.session) {
    redirect("/dashboard");
  }

  buildConfirmEmailRedirect(email);
}

export async function loginAction(formData: FormData): Promise<AuthFormResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { success: false, error: "이메일을 입력해주세요" };
  }

  if (!password) {
    return { success: false, error: "비밀번호를 입력해주세요" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (isEmailNotConfirmedError(error)) {
      return { success: false, error: AUTH_MESSAGES.emailNotConfirmed };
    }

    return { success: false, error: AUTH_MESSAGES.invalidCredentials };
  }

  if (data.user?.email) {
    const metadataName =
      typeof data.user.user_metadata?.name === "string"
        ? data.user.user_metadata.name
        : undefined;

    await syncPrismaUser(data.user.id, data.user.email, {
      name: metadataName,
      emailVerified: !!data.user.email_confirmed_at,
    });
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
