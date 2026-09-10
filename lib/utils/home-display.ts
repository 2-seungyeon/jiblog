export function formatHomeAddress(
  address: string,
  detailAddress?: string | null,
): string {
  const detail = detailAddress?.trim();
  if (!detail) {
    return address;
  }

  return `${address} ${detail}`;
}
