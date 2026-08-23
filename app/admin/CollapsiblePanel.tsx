import type { ReactNode } from "react";

export default function CollapsiblePanel({ label, title, defaultOpen = false, children }: { label: string; title: string; defaultOpen?: boolean; children: ReactNode }) {
  return <details className="admin-panel" open={defaultOpen}>
    <summary><span><small>{label}</small><b>{title}</b></span><i aria-hidden="true" /></summary>
    <div className="admin-panel-content">{children}</div>
  </details>;
}
