import { redirect } from "next/navigation";

import { EmailAuthPreview } from "@/app/(auth)/email-auth-preview/email-auth-preview-client";

export const dynamic = "force-dynamic";

export default function EmailAuthPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/login");
  }

  return <EmailAuthPreview />;
}
