"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ContactChannel, PolicySettings } from "../lib/content-types";

const STORAGE_KEY = "bubu-policy-consent";

type ConsentRecord = { version: string; acceptedAt: string; minimumAge: number };

function PlatformMark({ kind }: { kind: ContactChannel["kind"] }) {
  const text: Record<ContactChannel["kind"], string> = {
    wechat: "微", xianyu: "闲", qq: "Q", xiaohongshu: "红", douyin: "抖", link: "↗",
  };
  return <span className={`platform-mark platform-${kind}`} aria-hidden="true">{text[kind]}</span>;
}

export default function ContactGate({ bookingsOpen, contactNote, channels, policies, copy }: {
  bookingsOpen: boolean;
  contactNote: string;
  channels: ContactChannel[];
  policies: PolicySettings;
  copy: Record<string, string>;
}) {
  const t = (key: string, fallback: string) => copy[key] || fallback;
  const fill = (value: string) => value.replaceAll("{age}", String(policies.minimumAge));
  const [policyOpen, setPolicyOpen] = useState(false);
  const [selected, setSelected] = useState<ContactChannel | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<"idle" | "working" | "done" | "error">("idle");

  const enabledChannels = useMemo(() => channels.filter((channel) => channel.enabled), [channels]);
  const bookingChannels = enabledChannels.filter((channel) => channel.group === "booking");
  const socialChannels = enabledChannels.filter((channel) => channel.group === "social");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const record = JSON.parse(raw) as Partial<ConsentRecord>;
      if (record.version === policies.version && record.minimumAge === policies.minimumAge) setUnlocked(true);
    } catch { /* confirm again */ }
  }, [policies.minimumAge, policies.version]);

  useEffect(() => {
    if (!policyOpen && !selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [policyOpen, selected]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as { bubuContactLayer?: string; bubuContactId?: string } | null;
      if (state?.bubuContactLayer === "qr" && state.bubuContactId) {
        const channel = enabledChannels.find((item) => item.id === state.bubuContactId) || null;
        setSelected(channel);
        setShowQr(Boolean(channel));
        return;
      }
      if (state?.bubuContactLayer === "channel" && state.bubuContactId) {
        const channel = enabledChannels.find((item) => item.id === state.bubuContactId) || null;
        setSelected(channel);
        setShowQr(false);
        return;
      }
      setShowQr(false);
      setSelected(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [enabledChannels]);

  function accept() {
    if (!adult || !terms || !privacy) return;
    const record: ConsentRecord = { version: policies.version, acceptedAt: new Date().toISOString(), minimumAge: policies.minimumAge };
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch { /* continue */ }
    setUnlocked(true);
    setPolicyOpen(false);
  }

  function openChannel(channel: ContactChannel) {
    setSelected(channel);
    setShowQr(false);
    setDownloadState("idle");
    window.history.pushState({ ...(window.history.state || {}), bubuContactLayer: "channel", bubuContactId: channel.id }, "", window.location.href);
  }

  function closeChannel() {
    const layer = window.history.state?.bubuContactLayer;
    if (layer === "qr") {
      window.history.go(-2);
      return;
    }
    if (layer === "channel") {
      window.history.back();
      return;
    }
    setShowQr(false);
    setSelected(null);
  }

  function toggleQr(channel: ContactChannel) {
    if (showQr) {
      if (window.history.state?.bubuContactLayer === "qr") window.history.back();
      else setShowQr(false);
      return;
    }
    setShowQr(true);
    window.history.pushState({ ...(window.history.state || {}), bubuContactLayer: "qr", bubuContactId: channel.id }, "", window.location.href);
  }

  async function copyDetail(channel: ContactChannel) {
    if (!channel.detail) return;
    try {
      await navigator.clipboard.writeText(channel.detail);
      setCopied(channel.id);
      window.setTimeout(() => setCopied(null), 1800);
    } catch { setCopied(null); }
  }

  async function downloadQr(channel: ContactChannel) {
    if (!channel.qrImage) return;
    setDownloadState("working");
    try {
      const response = await fetch(channel.qrImage, { cache: "no-store" });
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
      anchor.download = `不不tarot-${channel.label}-二维码.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setDownloadState("done");
      window.setTimeout(() => setDownloadState("idle"), 1800);
    } catch { setDownloadState("error"); }
  }

  const renderChannelButton = (channel: ContactChannel) => (
    <button className="contact-choice" type="button" key={channel.id} onClick={() => openChannel(channel)}>
      <span className="contact-choice-main"><PlatformMark kind={channel.kind} /><span><b>{channel.label}</b>{channel.note && <small>{channel.note}</small>}</span></span>
      <span className="contact-choice-side">{channel.badge && <em>{channel.badge}</em>}<i>›</i></span>
    </button>
  );

  return (
    <div className="contact-gate">
      <p className="contact-gate-note editable-copy">{contactNote}</p>

      {!bookingsOpen ? (
        <div className="contact-closed"><b>{t("contactClosedTitle", "当前暂不接单")}</b><span>{t("contactClosedText", "预约重新开放后，这里会显示可用联系方式。")}</span></div>
      ) : !unlocked ? (
        <button className="contact-button contact-unlock" type="button" onClick={() => setPolicyOpen(true)}>{t("contactUnlockButton", "阅读预约须知并查看联系方式　↗")}</button>
      ) : (
        <div className="contact-channel-list">
          <div className="contact-unlocked-top"><span>{t("contactConfirmedPrefix", "已确认")} {policies.version}</span><button type="button" onClick={() => setPolicyOpen(true)}>{t("contactReviewButton", "重新查看预约须知")}</button></div>
          {enabledChannels.length ? <>
            {bookingChannels.length > 0 && <div className="contact-choice-group"><p>{t("contactPrimaryHeading", "选择你习惯的联系方式")}</p>{bookingChannels.map(renderChannelButton)}</div>}
            {socialChannels.length > 0 && <div className="contact-choice-group secondary"><p>{t("contactSocialHeading", "其他可以找到我的地方")}</p>{socialChannels.map(renderChannelButton)}</div>}
          </> : <div className="contact-closed"><b>{t("contactNoChannelsTitle", "联系方式正在整理")}</b><span>{t("contactNoChannelsText", "你已经完成预约须知确认，但目前没有启用的联系渠道。")}</span></div>}
          <p className="contact-policy-mini">{t("contactConfirmedPrefix", "已确认")}：{policies.version} · {t("policyEffectiveLabel", "生效日期")}：{policies.effectiveDate || t("policyMissingDate", "未填写")} · <Link href="/policies">{t("contactPolicyAll", "查看全部政策")}</Link></p>
        </div>
      )}

      {policyOpen && (
        <div className="policy-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPolicyOpen(false); }}>
          <section className="policy-modal" role="dialog" aria-modal="true" aria-labelledby="policy-modal-title">
            <button className="policy-modal-close" type="button" aria-label="关闭" onClick={() => setPolicyOpen(false)}>×</button>
            <div className="policy-modal-head"><span>{t("contactModalEyebrow", "BEFORE CONTACT")}</span><h2 id="policy-modal-title">{t("contactModalTitle", "在联系不不之前")}</h2><p>{policies.consentIntro}</p><small>{policies.version} · {t("policyEffectiveLabel", "生效日期")} {policies.effectiveDate || t("policyMissingDate", "未填写")}</small></div>
            <div className="policy-key-points">
              <p><b>{t("contactKey1Title", "服务边界")}</b>{t("contactKey1Text", "卡牌阅读用于娱乐、自我探索、角色创作与思路整理，不保证预测、通灵、改运或现实结果。")}</p>
              <p><b>{t("contactKey2Title", "高风险问题")}</b>{t("contactKey2Text", "重大疾病、生死、走失、法律结论、投资与赌博决策不作为个人解读范围。")}</p>
              <p><b>{t("contactKey3Title", "隐私提醒")}</b>{t("contactKey3Text", "只提供完成咨询必要的信息；截图请尽量遮挡第三人的姓名、手机号、账号和其他无关信息。")}</p>
            </div>
            <div className="policy-link-row"><Link href="/policies/service" target="_blank">{t("contactServiceLink", "服务说明 ↗")}</Link><Link href="/policies/risk" target="_blank">{t("contactRiskLink", "风险提示 ↗")}</Link><Link href="/policies/privacy" target="_blank">{t("contactPrivacyLink", "隐私政策 ↗")}</Link><Link href="/policies/refund" target="_blank">{t("contactRefundLink", "退款规则 ↗")}</Link></div>
            <div className="consent-checks">
              <label><input type="checkbox" checked={adult} onChange={(event) => setAdult(event.target.checked)} /><span>{fill(t("contactAdultConsent", "我已年满 {age} 周岁。"))}</span></label>
              <label><input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} /><span>{t("contactTermsConsent", "我已阅读并同意《服务说明》《退款规则》，并已知悉《风险提示》。")}</span></label>
              <label><input type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} /><span>{t("contactPrivacyConsent", "我已阅读《隐私政策》，了解咨询过程中必要信息的处理方式。")}</span></label>
            </div>
            <p className="policy-data-note">{t("contactDataNote", "请尽量不要提供与咨询无关的真实姓名、身份证号、精确住址等信息。网站只在浏览器本地记录本次政策版本与确认时间，用于减少重复提示。")}</p>
            <button className="policy-accept" type="button" disabled={!adult || !terms || !privacy} onClick={accept}>{t("contactAcceptButton", "确认并查看联系方式")}</button>
          </section>
        </div>
      )}

      {selected && (
        <div className="policy-modal-backdrop contact-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeChannel(); }}>
          <section className="contact-detail-modal" role="dialog" aria-modal="true" aria-labelledby="contact-detail-title">
            <button className="policy-modal-close" type="button" aria-label="关闭" onClick={closeChannel}>×</button>
            <div className="contact-detail-head"><PlatformMark kind={selected.kind} /><p>{selected.badge || t("contactDetailEyebrow", "CONTACT")}</p><h2 id="contact-detail-title">{selected.label}</h2>{selected.note && <span>{selected.note}</span>}</div>
            {selected.detail && <div className="contact-account"><small>{t("contactAccountLabel", "账号")}</small><strong>{selected.detail}</strong></div>}
            <div className="contact-action-grid">
              {selected.detail && <button type="button" onClick={() => copyDetail(selected)}>{copied === selected.id ? t("contactCopiedButton", "已复制 ✓") : t("contactCopyGeneric", "复制账号")}</button>}
              {selected.url && <a href={selected.url} target="_blank" rel="noreferrer">{t("contactOpenPrefix", "打开")}{selected.label} ↗</a>}
              {selected.qrImage && <button type="button" onClick={() => toggleQr(selected)}>{showQr ? t("contactHideQr", "收起二维码") : t("contactShowQr", "显示二维码")}</button>}
            </div>
            {selected.qrImage && showQr && <div className="contact-qr-panel"><img src={selected.qrImage} alt={`${selected.label}二维码`} /><div><p>{t("contactQrHint", "电脑端可以直接扫码；手机端可以保存二维码后，在对应 App 中识别。")}</p><button type="button" disabled={downloadState === "working"} onClick={() => downloadQr(selected)}>{downloadState === "working" ? t("contactSavingQr", "保存中…") : downloadState === "done" ? t("contactSavedQr", "已保存 ✓") : downloadState === "error" ? t("contactSaveQrRetry", "保存失败，点此重试") : t("contactSaveQr", "保存二维码")}</button></div></div>}
          </section>
        </div>
      )}
    </div>
  );
}
