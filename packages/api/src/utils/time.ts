export function timeToMinutes(timeStr: string): number {
  const [hours, mins] = timeStr.split(":").map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function addMinutesToTime(timeStr: string, minutes: number): string {
  return minutesToTime(timeToMinutes(timeStr) + minutes);
}

export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const startAMin = timeToMinutes(startA);
  const endAMin = timeToMinutes(endA);
  const startBMin = timeToMinutes(startB);
  const endBMin = timeToMinutes(endB);
  return Math.max(startAMin, startBMin) < Math.min(endAMin, endBMin);
}
