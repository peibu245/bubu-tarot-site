"use client";
/* Editor previews accept user-managed local or external QR image URLs. */
/* eslint-disable @next/next/no-img-element */

import { useState, type Dispatch, type SetStateAction } from "react";
import type { ContactChannel, SiteContent } from "../../lib/content-types";
import CollapsiblePanel from "./CollapsiblePanel";

const makeId = () => `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const labels: Record<ContactChannel["kind"], string> = { wechat: "微信", xianyu: "闲鱼", qq: "QQ", xiaohongshu: "小红书", douyin: "抖音", link: "其他链接" };

export default function ContactPolicyEditor({ content, setContent }: { content: SiteContent; setContent: Dispatch<SetStateAction<SiteContent>> }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const patchChannel = (id: string, patch: Partial<ContactChannel>) => setContent((current) => ({ ...current, contactChannels: current.contactChannels.map((channel) => channel.id === id ? { ...channel, ...patch } : channel) }));
  const patchPolicy = <K extends keyof SiteContent["policies"]>(key: K, value: SiteContent["policies"][K]) => setContent((current) => ({ ...current, policies: { ...current.policies, [key]: value } }));

  function addChannel() {
    setContent((current) => ({ ...current, contactChannels: [...current.contactChannels, { id: makeId(), kind: "link", label: "其他联系方式", detail: "", url: "", note: "", qrImage: "", badge: "", group: "social", enabled: false }] }));
  }

  function moveChannel(id: string, direction: -1 | 1) {
    setContent((current) => {
      const channels = [...current.contactChannels];
      const index = channels.findIndex((channel) => channel.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= channels.length) return current;
      [channels[index], channels[target]] = [channels[target], channels[index]];
      return { ...current, contactChannels: channels };
    });
  }

  async function uploadQr(channel: ContactChannel, file: File | null) {
    if (!file) return;
    setUploading(channel.id); setUploadError(null);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/studio-85810eea57bc0ee6/contact-image", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "上传失败");
      patchChannel(channel.id, { qrImage: result.url });
    } catch (error) { setUploadError(error instanceof Error ? error.message : "上传失败"); }
    finally { setUploading(null); }
  }

  return (
    <>
      <CollapsiblePanel label="05 / CONTACT" title="联系方式中心"><section className="editor-section">
        <div className="editor-title"><div><span>05 / CONTACT</span><h2>联系方式中心</h2></div><button className="admin-add" type="button" onClick={addChannel}>＋ 添加渠道</button></div>
        <p className="manager-hint">访客完成预约须知确认后，会先看到一个简洁的平台按钮列表，点某个平台才弹出账号、外链和二维码。手机端可以复制账号、保存二维码；二维码支持在这里直接上传替换。</p>
        {uploadError && <p className="admin-inline-error">二维码上传失败：{uploadError}</p>}
        <div className="editor-cards contact-editors">
          {content.contactChannels.map((channel, index) => (
            <article className="editor-card" key={channel.id}>
              <div className="card-admin-top"><b>{String(index + 1).padStart(2, "0")} · {channel.label || "联系方式"}</b><div className="contact-order-buttons"><button type="button" disabled={index === 0} onClick={() => moveChannel(channel.id, -1)}>↑</button><button type="button" disabled={index === content.contactChannels.length - 1} onClick={() => moveChannel(channel.id, 1)}>↓</button><button type="button" onClick={() => setContent((current) => ({ ...current, contactChannels: current.contactChannels.filter((item) => item.id !== channel.id) }))}>删除</button></div></div>
              <div className="form-grid">
                <label>渠道类型<select value={channel.kind} onChange={(event) => { const kind = event.target.value as ContactChannel["kind"]; patchChannel(channel.id, { kind, label: channel.label || labels[kind] }); }}><option value="wechat">微信</option><option value="xianyu">闲鱼</option><option value="qq">QQ</option><option value="xiaohongshu">小红书</option><option value="douyin">抖音</option><option value="link">其他链接</option></select></label>
                <label>显示分组<select value={channel.group} onChange={(event) => patchChannel(channel.id, { group: event.target.value as ContactChannel["group"] })}><option value="booking">推荐联系 / 交易</option><option value="social">其他可以找到我的地方</option></select></label>
                <label>显示名称<input value={channel.label} onChange={(event) => patchChannel(channel.id, { label: event.target.value })} placeholder={labels[channel.kind]} /></label>
                <label>小标签<input value={channel.badge} onChange={(event) => patchChannel(channel.id, { badge: event.target.value })} placeholder="例如：推荐 / 平台交易" /></label>
                <label>账号 / 用户名<input value={channel.detail} onChange={(event) => patchChannel(channel.id, { detail: event.target.value })} placeholder="用于复制给访客" /></label>
                <label>外部链接<input value={channel.url} onChange={(event) => patchChannel(channel.id, { url: event.target.value })} placeholder="没有稳定链接可以留空" /></label>
                <label className="wide">渠道说明<textarea rows={2} value={channel.note} onChange={(event) => patchChannel(channel.id, { note: event.target.value })} placeholder="例如：日常咨询与预约" /></label>
                <label className="wide">二维码图片地址<input value={channel.qrImage} onChange={(event) => patchChannel(channel.id, { qrImage: event.target.value })} placeholder="上传后自动填写，也可以填 /contact/xxx.jpg" /></label>
              </div>
              <div className="contact-image-admin">
                <div className="contact-image-preview">{channel.qrImage ? <img src={channel.qrImage} alt={`${channel.label}二维码预览`} /> : <span>暂无二维码</span>}</div>
                <div><label className="admin-file-button">{uploading === channel.id ? "上传中…" : "上传 / 替换二维码"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading === channel.id} onChange={(event) => { void uploadQr(channel, event.target.files?.[0] || null); event.currentTarget.value = ""; }} /></label><small>JPG / PNG / WEBP，最大 6MB。上传后记得点页面底部“保存并发布”。</small></div>
              </div>
              <div className="check-row"><label><input type="checkbox" checked={channel.enabled} onChange={(event) => patchChannel(channel.id, { enabled: event.target.checked })} /> 对已确认须知的访客显示</label></div>
            </article>
          ))}
        </div>
      </section></CollapsiblePanel>

      <CollapsiblePanel label="06 / POLICIES" title="预约政策与版本"><section className="editor-section policy-editor-section">
        <div className="editor-title"><div><span>06 / POLICIES</span><h2>预约政策与版本</h2></div></div>
        <p className="manager-hint">如果你对服务边界、隐私处理或退款条件做了实质性修改，请同时提高“政策版本”，例如 V1.0 → V1.1。访客浏览器检测到新版本后会重新要求确认。</p>
        <div className="form-grid policy-meta-grid">
          <label>政策版本<input value={content.policies.version} onChange={(event) => patchPolicy("version", event.target.value)} placeholder="V1.0" /></label>
          <label>生效日期<input type="date" value={content.policies.effectiveDate} onChange={(event) => patchPolicy("effectiveDate", event.target.value)} /></label>
          <label>付费服务最低年龄<input type="number" min="18" max="100" value={content.policies.minimumAge} onChange={(event) => patchPolicy("minimumAge", Number(event.target.value) || 18)} /></label>
          <label className="wide">联系前提示简介<textarea rows={3} value={content.policies.consentIntro} onChange={(event) => patchPolicy("consentIntro", event.target.value)} /></label>
        </div>
        <div className="policy-text-editors">
          <label><span>服务说明</span><small>服务性质、接单范围、服务方式、年龄限制</small><textarea rows={16} value={content.policies.service} onChange={(event) => patchPolicy("service", event.target.value)} /></label>
          <label><span>风险提示</span><small>解释边界、高风险问题、反恐吓消费说明</small><textarea rows={14} value={content.policies.risk} onChange={(event) => patchPolicy("risk", event.target.value)} /></label>
          <label><span>隐私政策</span><small>收集内容、使用目的、第三人信息、本地确认记录</small><textarea rows={18} value={content.policies.privacy} onChange={(event) => patchPolicy("privacy", event.target.value)} /></label>
          <label><span>退款规则</span><small>未开始、进行中、已交付、第三方平台交易</small><textarea rows={16} value={content.policies.refund} onChange={(event) => patchPolicy("refund", event.target.value)} /></label>
        </div>
      </section></CollapsiblePanel>
    </>
  );
}
