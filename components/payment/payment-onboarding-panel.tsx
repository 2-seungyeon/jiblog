import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type PaymentOnboardingPanelProps = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  variant?: "primary" | "secondary";
};

export function PaymentOnboardingPanel({
  title,
  description,
  href,
  actionLabel,
  variant = "primary",
}: PaymentOnboardingPanelProps) {
  return (
    <Panel className="ui-panel-empty-state">
      <div className="space-y-2">
        <p className="ui-panel-title">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <Link href={href}>
        <Button type="button" variant={variant} className="w-full sm:w-auto">
          {actionLabel}
        </Button>
      </Link>
    </Panel>
  );
}
