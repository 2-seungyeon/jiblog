import type { HomeListItem } from "@/lib/types/homes";

export type OnboardingStep = "no-home" | "no-contract" | "ready";

export function getOnboardingStep(homes: HomeListItem[]): {
  step: OnboardingStep;
  primaryHomeId?: string;
  hasMonthlyRentContract: boolean;
} {
  if (homes.length === 0) {
    return { step: "no-home", hasMonthlyRentContract: false };
  }

  const primaryHome = homes.find((home) => home.isPrimary) ?? homes[0];
  const homesWithContract = homes.filter((home) => home.contract.hasContract);

  if (homesWithContract.length === 0) {
    return {
      step: "no-contract",
      primaryHomeId: primaryHome.id,
      hasMonthlyRentContract: false,
    };
  }

  const hasMonthlyRentContract = homesWithContract.some(
    (home) => home.contract.hasContract && home.contract.type !== "전세",
  );

  return {
    step: "ready",
    primaryHomeId: primaryHome.id,
    hasMonthlyRentContract,
  };
}
