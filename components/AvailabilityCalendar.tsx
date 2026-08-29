"use client";

import { useMemo, useState } from "react";
import type { AvailabilitySettings } from "../lib/content-types";
import { addDays, dateFromKey, dateKey, monthCells, monthKey, resolveAvailability, statusLabels, weekdayNames } from "../lib/availability";

export default function AvailabilityCalendar({ settings, todayKey }: { settings: AvailabilitySettings; todayKey: string }) {
  const [view, setView] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState("");
  const today = useMemo(() => dateFromKey(todayKey), [todayKey]);
  const [visibleMonth, setVisibleMonth] = useState(() => monthKey(dateFromKey(todayKey)));
  const lastDay = addDays(today, settings.advanceDays - 1);
  const days = useMemo(() => Array.from({ length: settings.advanceDays }, (_, index) => addDays(today, index)), [settings.advanceDays, today]);
  const weekDays = days.slice(weekOffset * 7, weekOffset * 7 + 7);
  const monthDate = useMemo(() => dateFromKey(`${visibleMonth}-01`), [visibleMonth]);
  const calendarDays = useMemo(() => monthCells(monthDate), [monthDate]);
  const firstMonth = monthKey(today);
  const lastMonth = monthKey(lastDay);
  const chosen = selected ? days.find((date) => dateKey(date) === selected) : undefined;
  const chosenStatus = chosen ? resolveAvailability(settings, chosen) : undefined;
  const inRange = (date: Date) => dateKey(date) >= todayKey && dateKey(date) <= dateKey(lastDay);
  const canChoose = (date: Date) => inRange(date) && ["available", "limited"].includes(resolveAvailability(settings, date).status);
  const formatRange = `${today.getMonth() + 1}.${today.getDate()}—${lastDay.getMonth() + 1}.${lastDay.getDate()}`;
  const changeMonth = (amount: number) => {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + amount, 1, 12);
    const key = monthKey(next);
    if (key >= firstMonth && key <= lastMonth) setVisibleMonth(key);
  };
  const showMonth = () => {
    const anchor = weekDays[0] || today;
    setVisibleMonth(monthKey(anchor));
    setView("month");
  };

  return <div className="availability-calendar">
    <div className="availability-toolbar"><div><b>未来 {settings.advanceDays} 天</b><span>{formatRange}</span></div><div className="availability-view-toggle"><button className={view === "week" ? "is-active" : ""} type="button" onClick={() => setView("week")}>周视图</button><button className={view === "month" ? "is-active" : ""} type="button" onClick={showMonth}>月视图</button></div></div>
    {view === "week" && <div className="availability-week-nav"><button type="button" disabled={weekOffset === 0} onClick={() => setWeekOffset((value) => Math.max(0, value - 1))}>← 上一周</button><span>第 {weekOffset + 1} 周</span><button type="button" disabled={(weekOffset + 1) * 7 >= days.length} onClick={() => setWeekOffset((value) => value + 1)}>下一周 →</button></div>}
    {view === "month" && <><div className="availability-month-nav"><button type="button" disabled={visibleMonth <= firstMonth} onClick={() => changeMonth(-1)} aria-label="上一个月">←</button><b>{monthDate.getFullYear()} 年 {monthDate.getMonth() + 1} 月</b><button type="button" disabled={visibleMonth >= lastMonth} onClick={() => changeMonth(1)} aria-label="下一个月">→</button></div><div className="availability-month-head">{weekdayNames.map((name) => <span key={name}>{name.slice(1)}</span>)}</div></>}
    <div className={view === "week" ? "availability-public-grid is-week" : "availability-public-grid is-month"}>
      {view === "week" ? weekDays.map((date) => { const state = resolveAvailability(settings, date); const key = dateKey(date); const active = selected === key; return <button className={`availability-public-day is-${state.status}${active ? " is-selected" : ""}`} type="button" disabled={!canChoose(date)} onClick={() => setSelected(key)} key={key}><span>{weekdayNames[date.getDay()]}</span><b>{date.getMonth() + 1}.{date.getDate()}</b><i><em />{statusLabels[state.status]}</i>{state.note && <small>{state.note}</small>}</button>; }) : calendarDays.map((date, index) => {
        if (!date) return <span className="availability-calendar-empty" key={`empty-${index}`} />;
        const state = resolveAvailability(settings, date); const key = dateKey(date); const active = selected === key; const availableRange = inRange(date);
        return <button className={`availability-public-day is-${state.status}${active ? " is-selected" : ""}${availableRange ? "" : " is-outside-range"}`} type="button" disabled={!canChoose(date)} onClick={() => setSelected(key)} key={key}><b>{date.getDate()}</b>{availableRange && <i><em />{statusLabels[state.status]}</i>}{availableRange && state.note && <small>{state.note}</small>}</button>;
      })}
    </div>
    {chosen && chosenStatus && <div className="availability-selection"><div><span>意向日期</span><b>{chosen.getMonth() + 1} 月 {chosen.getDate()} 日 · {weekdayNames[chosen.getDay()]}</b><small>{chosenStatus.status === "limited" ? "档期较紧张，建议尽快确认。" : "最终档期以联系确认结果为准。"}</small></div><a href="#contact">带着日期去联系　→</a></div>}
  </div>;
}
