import type { ContractExpiryStatus } from "@/lib/utils/contract-status";

export type ContractGuidanceMode = "edit" | "renewal";

export function getContractEditPageDescription(mode: ContractGuidanceMode): string {
  if (mode === "renewal") {
    return "만료된 계약을 이어서 관리하려면 새 기간과 금액을 입력해주세요. 이미 완료한 납부 기록은 그대로 남아요.";
  }

  return "금액이나 기간을 바꿀 수 있어요. 종료일을 앞당기면 계약이 끝난 것으로 처리돼요.";
}

export function getContractGuidanceTitle(mode: ContractGuidanceMode): string {
  return mode === "renewal" ? "계약 갱신 안내" : "계약 수정 · 중단 안내";
}

export function getContractGuidanceSteps(
  mode: ContractGuidanceMode,
): readonly string[] {
  if (mode === "renewal") {
    return [
      "새 계약 시작일·종료일·금액을 입력해주세요.",
      "저장하면 월세·관리비 일정을 다시 관리할 수 있어요.",
      "이전에 완료한 납부 기록은 변경되지 않아요.",
    ];
  }

  return [
    "금액·기간 변경은 예정 납부에만 반영돼요. 완료한 납부는 그대로 남아요.",
    "중도 퇴거(계약 중단)는 종료일을 실제 퇴거일로 수정하면 돼요.",
    "퇴거 후에는 집 정보에서 거주 상태를 '과거 거주'로 바꿔주세요.",
    "계약이 이미 끝났다면 '계약 갱신'으로 새 기간을 등록해주세요.",
  ];
}

export function getContractEndDateHelperText(mode: ContractGuidanceMode): string {
  if (mode === "renewal") {
    return "새 계약의 종료일을 입력해주세요.";
  }

  return "계약을 끝내려면 종료일을 실제 퇴거일로 바꿔주세요.";
}

export function getContractHomeDetailGuidance(
  status: ContractExpiryStatus,
): { title: string; steps: readonly string[] } | null {
  switch (status) {
    case "notice":
      return {
        title: "계약 종료가 다가오고 있어요",
        steps: [
          "갱신할 계약이면 '계약 수정'에서 기간과 금액을 업데이트해주세요.",
          "이사할 계획이면 종료일을 퇴거일로 맞춘 뒤, 집 정보에서 거주 상태를 변경해주세요.",
        ],
      };
    case "warning":
      return {
        title: "계약 종료가 얼마 남지 않았어요",
        steps: [
          "갱신할 계약이면 '계약 갱신하기'에서 새 기간을 등록해주세요.",
          "중도 퇴거면 '계약 수정'에서 종료일을 퇴거일로 바꿔주세요.",
          "퇴거 후에는 집 정보에서 거주 상태를 '과거 거주'로 변경해주세요.",
        ],
      };
    case "expired":
      return {
        title: "계약 기간이 끝났어요",
        steps: [
          "같은 집에서 이어서 살면 '계약 갱신하기'로 새 기간을 등록해주세요.",
          "이미 이사했다면 집 정보에서 거주 상태를 '과거 거주'로 변경해주세요.",
          "완료한 납부 기록은 그대로 남아요.",
        ],
      };
    default:
      return null;
  }
}
