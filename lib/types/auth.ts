export type SignUpFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

export type SignUpResult =
  | { success: true }
  | { success: false; error?: string; errors?: SignUpFieldErrors };

export type AuthFormResult =
  | { success: true }
  | { success: false; error: string };
