"use client";

import { useMemo, useState } from "react";
import type { AvailabilityOverride, AvailabilitySettings, AvailabilityStatus, SiteContent } from "../../lib/content-types";
import { dateKey, monthCells, resolveAvailability, statusLabels, weekdayNames } from "../../lib/availability";

const statuses: AvailabilityStatus[] = ["available", "limited", "full", "rest"];

export default function AvailabilityEditor({ content, setContent }: { content: SiteContent; setContent: React.Dispatch<React.SetStateAction<SiteContent>> }) {
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const cells = useMemo(() => monthCells(month), [month]);
  const selectedDate = new Date(`${selected}T12:00:00`);
  const selectedOverride = content.availability.overrides.find((item) => item.date === selected);
  const resolved = resolveAvailability(content.availability, selectedDate);
  const patch = (next: Partial<AvailabilitySettings>) => setContent((current) => ({ ...current, availability: { ...current.availability, ...next } }));
  const patchWeekly = (weekday: number, status: AvailabilityStatus) => patch({ weekly: content.availability.weekly.map((item) => item.weekday === weekday ? { ...item, status } : item) });
  const setOverride = (status: AvailabilityStatus, note = selectedOverride?.note || "") => {
    const next: AvailabilityOverride = { date: selected, status, note };
    patch({ overrides: [...content.availability.overrides.filter((item) => item.date !== selected), next].sort((a, b) => a.date.localeCompare(b.date)) });
  };
  const clearOverride = () => patch({ overrides: content.availability.overrides.filter((item) => item.date !== selected) });

  return <div className="availability-admin wide-admin-row">
    <div className="availability-admin-heading"><div><b>档期日历</b><p>先设每周固定营业日；临时休息或满单时，只需在月历里点对应日期修改。</p></div><label><input type="checkbox" checked={content.availability.visible} onChange={(event) => patch({ visible: event.target.checked })} /> 在预约页显示</label></div>
    <div className="form-grid"><label>区块标题<input value={content.availability.title} onChange={(event) => patch({ title: event.target.value })} /></label><label>开放未来天数<input type="number" min="14" max="45" value={content.availability.advanceDays} onChange={(event) => patch({ advanceDays: Number(event.target.value) })} /></label><label className="wide">回复时间说明<input value={content.availability.responseText} onChange={(event) => patch({ responseText: event.target.value })} /></label><label className="wide">加急说明<input value={content.availability.rushText} onChange={(event) => patch({ rushText: event.target.value })} /></label></div>
    <div className="weekly-rule-editor"><h3>每周固定安排</h3><div>{content.availability.weekly.map((rule) => <label key={rule.weekday}><b>{weekdayNames[rule.weekday]}</b><select value={rule.status} onChange={(event) => patchWeekly(rule.weekday, event.target.value as AvailabilityStatus)}>{statuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label>)}</div></div>
    <div className="admin-calendar"><div className="admin-calendar-head"><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><b>{month.getFullYear()} 年 {month.getMonth() + 1} 月</b><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div><div className="admin-calendar-weekdays">{weekdayNames.map((name) => <span key={name}>{name.slice(1)}</span>)}</div><div className="admin-calendar-grid">{cells.map((date, index) => date ? (() => { const state = resolveAvailability(content.availability, date); const key = dateKey(date); const overridden = content.availability.overrides.some((item) => item.date === key); return <button type="button" className={`is-${state.status}${selected === key ? " is-selected" : ""}`} onClick={() => setSelected(key)} key={key}><b>{date.getDate()}</b><span>{statusLabels[state.status]}</span>{overridden && <i>已改</i>}</button>; })() : <span key={`empty-${index}`} />)}</div></div>
    <div className="calendar-day-editor"><div><span>正在修改</span><b>{selectedDate.getMonth() + 1} 月 {selectedDate.getDate()} 日 · {weekdayNames[selectedDate.getDay()]}</b><small>{selectedOverride ? "这是单独设置，优先于每周固定安排。" : `目前跟随每周安排：${statusLabels[resolved.status]}`}</small></div><label>当天状态<select value={selectedOverride?.status || resolved.status} onChange={(event) => setOverride(event.target.value as AvailabilityStatus)}>{statuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label><label>当天备注<input value={selectedOverride?.note || ""} onChange={(event) => setOverride(selectedOverride?.status || resolved.status, event.target.value)} placeholder="例如：仅剩 1 位" /></label><button type="button" disabled={!selectedOverride} onClick={clearOverride}>恢复每周安排</button></div>
  </div>;
}
