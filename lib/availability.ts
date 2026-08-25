import type { AvailabilitySettings, AvailabilityStatus } from "./content-types";

export const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
export const statusLabels: Record<AvailabilityStatus, string> = { available: "可约", limited: "紧张", full: "已满", rest: "休息" };

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
