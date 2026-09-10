export const AUTH_MESSAGES = {
  emailNotConfirmed:
    "이메일 인증을 완료한 후 로그인해주세요. 받은 편지함을 확인해주세요.",
  invalidCredentials: "이메일 또는 비밀번호가 올바르지 않아요",
  signupEmailExistsVerified: "이미 가입된 이메일입니다. 로그인해주세요.",
  signupEmailExistsPending:
    "이미 가입 요청이 완료되었습니다. 이메일 인증을 완료해주세요.",
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isEmailNotConfirmedError(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "email_not_confirmed" ||
    error.message?.toLowerCase().includes("email not confirmed") === true
  );
}

export function isDuplicateSignUpUser(user: {
  identities?: Array<{ id: string }>;
} | null): boolean {
  return user?.identities?.length === 0;
}
