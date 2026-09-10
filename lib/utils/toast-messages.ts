export const TOAST_MESSAGES = {
  saved: "저장했어요.",
  updated: "수정했어요.",
  deleted: "삭제했어요.",
  paymentComplete: "납부 완료했어요.",
} as const;

export function getActionErrorMessage(message?: string): string {
  if (message?.trim()) {
    return message;
  }

  return "요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.";
}
