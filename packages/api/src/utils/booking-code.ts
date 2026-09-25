const UNAMBIGUOUS_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateBookingCode(dateStr: string): string {
  const cleanDate = dateStr.replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length);
    suffix += UNAMBIGUOUS_CHARS[randomIndex];
  }
  return `#SC-${cleanDate}-${suffix}`;
}
