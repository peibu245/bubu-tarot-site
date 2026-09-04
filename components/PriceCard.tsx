import Link from "next/link";
import type { PriceItem } from "../lib/content-types";

type Props = {
  item: PriceItem;
  featuredNote: string;
  bookingsOpen: boolean;
  actionHref?: string;
  actionLabel?: string;
};

export default function PriceCard({
  item,
  featuredNote,
  bookingsOpen,
  actionHref = "/booking#contact",
  actionLabel,
}: Props) {
  const isNumber = /^\d+(?:\.\d+)?$/.test(item.price);
  const statusLabel = item.status === "paused" ? "暂不接单" : item.status === "waitlist" ? "可候补" : "开放预约";
  const defaultActionLabel = item.status === "waitlist" ? "了解候补方式" : "选这个并联系";

  return (
    <article className={item.featured ? "booking-price-card featured-price" : "booking-price-card"}>
      <div className="booking-price-top">
        <div><span>{item.badge || item.section}</span><h3>{item.title}</h3><small>{item.section}</small></div>
        <div className="booking-money">{isNumber && <i>¥</i>}<b>{item.price}</b><small>{item.unit}</small></div>
      </div>
      <p>{item.description}</p>
      {(item.delivery || item.turnaround || item.followUp || item.suitableFor) && <dl className="service-meta">
        {item.delivery && <><dt>交付</dt><dd>{item.delivery}</dd></>}
        {item.turnaround && <><dt>预计</dt><dd>{item.turnaround}</dd></>}
        {item.followUp && <><dt>补充</dt><dd>{item.followUp}</dd></>}
        {item.suitableFor && <><dt>适合</dt><dd>{item.suitableFor}</dd></>}
      </dl>}
      <span className={`service-status status-${item.status}`}>{statusLabel}</span>
      {item.featured && <strong className="featured-note">{featuredNote}</strong>}
      {bookingsOpen && item.status !== "paused" && <Link className="service-card-cta" href={actionHref}>{actionLabel || defaultActionLabel}<span aria-hidden="true">→</span></Link>}
    </article>
  );
}
