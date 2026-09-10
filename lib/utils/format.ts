export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

/** 화면 표시용 금액 (예: 10,000,000원) */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 숫자만 추출 (Form 제출용) */
export function parseAmountInput(value: string): string {
  return value.replace(/\D/g, "");
}

/** 금액 입력 필드 표시용 천 단위 콤마 */
export function formatAmountInput(value: string | number | undefined): string {
  const digits = parseAmountInput(String(value ?? ""));

  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("ko-KR");
}
