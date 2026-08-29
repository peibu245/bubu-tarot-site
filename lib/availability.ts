import type { AvailabilitySettings, AvailabilityStatus } from "./content-types";

export const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
export const statusLabels: Record<AvailabilityStatus, string> = { available: "可约", limited: "紧张", full: "已满", rest: "休息" };
export const publicTimeZone = "Asia/Shanghai";

export function dateKeyInTimeZone(date = new Date(), timeZone = publicTimeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

export function resolveAvailability(settings: AvailabilitySettings, date: Date) {
  const override = settings.overrides.find((item) => item.date === dateKey(date));
  if (override) return override;
  return settings.weekly.find((item) => item.weekday === date.getDay()) || { weekday: date.getDay(), status: "rest" as const, note: "" };
}

export function monthCells(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const cells: Array<Date | null> = Array.from({ length: start.getDay() }, () => null);
  for (let day = 1; day <= end.getDate(); day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (cells.length % 7) cells.push(null);
  return cells;
}
