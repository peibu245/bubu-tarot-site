export type CopyField = {
  key: string;
  label: string;
  multiline?: boolean;
  hint?: string;
};

export type CopyPage = {
  id: string;
  title: string;
  path: string;
  note: string;
  fields: CopyField[];
};

const f = (key: string, label: string, multiline = false, hint = ""): CopyField => ({ key, label, multiline, hint });

export const copyPages: CopyPage[] = [
  {
    id: "global",
    title: "全站通用",
    path: "/",
    note: "导航、页脚、状态文字和全站共用的小标签。",
    fields: [
      f("siteBrand", "网站名称"), f("navDream", "导航：梦向"), f("navReality", "导航：现实"), f("navBooking", "导航：预约"), f("navNotes", "导航：抽一张"), f("navIdeas", "导航/页脚：奇思妙想"), f("navAction", "导航右侧按钮"),
      f("footerIntro", "页脚介绍", true), f("footerServiceTitle", "页脚服务标题"), f("footerBookingTitle", "页脚预约标题"), f("footerBookingLink", "页脚价格链接"), f("footerPoliciesLink", "页脚政策链接"), f("footerNotesLink", "页脚阅读链接"), f("footerCopyright", "页脚版权说明", true),
      f("statusOpen", "开放预约状态"), f("statusClosed", "暂停预约状态"), f("featuredNote", "价格卡推荐标签"), f("pricingPending", "定价中"), f("promoNow", "活动日期：现在"), f("promoTbd", "活动日期：另行通知"), f("itemCountSuffix", "项目数量后缀", false, "例如：个项目；数量会自动放在前面"), f("priceGroupDream", "价格分组：梦占"), f("priceGroupMessage", "价格分组：传讯"), f("priceGroupReality", "价格分组：现实咨询"), f("priceGroupIdeas", "价格分组：奇思妙想"),
    ],
  },
  {
    id: "home",
    title: "首页",
    path: "/",
    note: "首页主标题、名片、服务卡片、方法区、活动区和预约横幅。",
    fields: [
      f("homeEyebrow", "顶部英文小字"), f("homeTitle", "网站主标题"), f("homeDeckline", "主标题下方分类"), f("homeLead", "开头介绍", true), f("homePrimaryAction", "主按钮"), f("homeSecondaryAction", "次按钮"),
      f("homeReaderEst", "名片年份/小字"), f("homeReaderName", "名片名称"), f("homeReaderRole", "名片说明"), f("homeReaderNote1", "名片短句 1"), f("homeReaderNote2", "名片短句 2"), f("homeReaderNote3", "名片短句 3"),
      f("homeServiceEyebrow", "服务区英文小字"), f("homeServiceTitle", "服务区标题"), f("homeServiceLead", "服务区说明", true), f("homeCardLink", "服务卡片链接"),
      f("homeDreamLabel", "梦向卡片英文小字"), f("homeDreamTitle", "梦向卡片标题"), f("homeDreamSummary", "梦向卡片短句"), f("homeDreamDetail", "梦向卡片说明", true),
      f("homeRealityLabel", "现实卡片英文小字"), f("homeRealityTitle", "现实卡片标题"), f("homeRealitySummary", "现实卡片短句"), f("homeRealityDetail", "现实卡片说明", true),
      f("homeIdeasLabel", "奇思妙想卡片英文小字"), f("homeIdeasTitle", "奇思妙想卡片标题"), f("homeIdeasSummary", "奇思妙想卡片短句"), f("homeIdeasDetail", "奇思妙想卡片说明", true),
      f("homeAboutEyebrow", "方法区英文小字"), f("homeAboutTitle", "方法区标题"), f("homeAboutText", "方法区介绍", true), f("homePortraitMark", "头像区角标"),
      f("homeMethod1Title", "步骤 1 标题"), f("homeMethod1Text", "步骤 1 说明", true), f("homeMethod2Title", "步骤 2 标题"), f("homeMethod2Text", "步骤 2 说明", true), f("homeMethod3Title", "步骤 3 标题"), f("homeMethod3Text", "步骤 3 说明", true),
      f("homeOfferEyebrow", "活动区英文小字"), f("homeOfferTitle", "活动区标题"), f("homeOfferLink", "活动区链接"), f("homeNotesEyebrow", "科普预览英文小字"), f("homeNotesTitle", "科普预览标题"), f("homeNotesLink", "科普预览总链接"),
      f("homeNote1Tag", "首页科普 1 标签"), f("homeNote1Title", "首页科普 1 标题"), f("homeNote1Text", "首页科普 1 说明", true), f("homeNote2Tag", "首页科普 2 标签"), f("homeNote2Title", "首页科普 2 标题"), f("homeNote2Text", "首页科普 2 说明", true), f("homeNote3Tag", "首页科普 3 标签"), f("homeNote3Title", "首页科普 3 标题"), f("homeNote3Text", "首页科普 3 说明", true), f("homeNoteLink", "首页科普卡片按钮"),
      f("homeBookingEyebrow", "底部预约英文小字"), f("homeBookingTitle", "底部预约标题"), f("homeBookingAction", "底部预约按钮"),
    ],
  },
  {
    id: "dream",
    title: "梦向解读",
    path: "/dream",
    note: "梦占与传讯页面，包括标题、分类卡片、可看内容、准备事项和 CTA。",
    fields: [
      f("dreamEyebrow", "顶部英文小字"), f("dreamTitle", "页面主标题"), f("dreamLead", "主标题下方说明", true), f("dreamIntro", "服务介绍", true),
      f("dreamSub1Label", "梦占卡片英文小字"), f("dreamSub1Title", "梦占卡片标题"), f("dreamSub1Text", "梦占卡片说明", true), f("dreamSub2Label", "传讯卡片英文小字"), f("dreamSub2Title", "传讯卡片标题"), f("dreamSub2Text", "传讯卡片说明", true),
      f("dreamAboutEyebrow", "说明区英文小字"), f("dreamAboutTitle", "说明区标题"), f("dreamContentHeading", "可看内容标题"), f("dreamContent1", "可看内容 1"), f("dreamContent2", "可看内容 2"), f("dreamContent3", "可看内容 3"), f("dreamContent4", "可看内容 4"),
      f("dreamPrepareHeading", "预约准备标题"), f("dreamPrepare1", "预约准备 1"), f("dreamPrepare2", "预约准备 2"), f("dreamPrepare3", "预约准备 3"), f("dreamPrepare4", "预约准备 4"),
      f("dreamPriceEyebrow", "价格区英文小字"), f("dreamPriceTitle", "价格区标题"), f("dreamOfferEyebrow", "活动区英文小字"), f("dreamOfferTitle", "活动区标题"), f("dreamCtaEyebrow", "底部英文小字"), f("dreamCtaTitle", "底部标题"), f("dreamCtaText", "底部说明", true), f("dreamCtaAction", "底部按钮"), f("dreamPendingTitle", "未定价标题"), f("dreamPendingDream", "梦占未定价说明", true), f("dreamPendingMessage", "传讯未定价说明", true),
    ],
  },
  {
    id: "reality",
    title: "现实问题咨询",
    path: "/reality",
    note: "现实咨询页面的完整可见文案。",
    fields: [
      f("realityEyebrow", "顶部英文小字"), f("realityTitle", "页面主标题"), f("realityLead", "主标题下方说明", true), f("realityIntro", "服务介绍", true), f("realityAboutEyebrow", "说明区英文小字"), f("realityAboutTitle", "说明区标题"),
      f("realityContentHeading", "可看内容标题"), f("realityContent1", "可看内容 1"), f("realityContent2", "可看内容 2"), f("realityContent3", "可看内容 3"), f("realityContent4", "可看内容 4"), f("realityPrepareHeading", "预约准备标题"), f("realityPrepare1", "预约准备 1"), f("realityPrepare2", "预约准备 2"), f("realityPrepare3", "预约准备 3"), f("realityPrepare4", "预约准备 4"),
      f("realityPriceEyebrow", "价格区英文小字"), f("realityPriceTitle", "价格区标题"), f("realityOfferEyebrow", "活动区英文小字"), f("realityOfferTitle", "活动区标题"), f("realityCtaEyebrow", "底部英文小字"), f("realityCtaTitle", "底部标题"), f("realityCtaText", "底部说明", true), f("realityCtaAction", "底部按钮"), f("realityPendingTitle", "未定价标题"), f("realityPendingText", "未定价说明", true),
    ],
  },
  {
    id: "ideas",
    title: "奇思妙想",
    path: "/ideas",
    note: "OC、宠物和特殊主题页面，之前写死的文字现在全部放进后台。",
    fields: [
      f("ideasEyebrow", "顶部英文小字"), f("ideasTitle", "页面主标题"), f("ideasLead", "主标题下方说明", true), f("ideasIntro", "服务介绍", true), f("ideasAboutEyebrow", "说明区英文小字"), f("ideasAboutTitle", "说明区标题"),
      f("ideasContentHeading", "可看内容标题"), f("ideasContent1", "可看内容 1"), f("ideasContent2", "可看内容 2"), f("ideasContent3", "可看内容 3"), f("ideasContent4", "可看内容 4"), f("ideasPrepareHeading", "预约准备标题"), f("ideasPrepare1", "预约准备 1"), f("ideasPrepare2", "预约准备 2"), f("ideasPrepare3", "预约准备 3"), f("ideasPrepare4", "预约准备 4"),
      f("ideasPriceEyebrow", "价格区英文小字"), f("ideasPriceTitle", "价格区标题"), f("ideasOfferEyebrow", "活动区英文小字"), f("ideasOfferTitle", "活动区标题"), f("ideasCtaEyebrow", "底部英文小字"), f("ideasCtaTitle", "底部标题"), f("ideasCtaText", "底部说明", true), f("ideasCtaAction", "底部按钮"), f("ideasPendingTitle", "未定价标题"), f("ideasPendingText", "未定价说明", true),
    ],
  },
  {
    id: "booking",
    title: "预约页",
    path: "/booking",
    note: "入口卡片、预约步骤、准备问题、接单范围和联系区标题。",
    fields: [
      f("bookingEyebrow", "顶部英文小字"), f("bookingTitle", "页面主标题"), f("bookingLead", "页面说明", true), f("bookingStep1Label", "第一步标签"), f("bookingStep1Title", "第一步标题"), f("bookingEntryAction", "入口卡片按钮"),
      f("bookingDreamEyebrow", "梦向入口英文小字"), f("bookingDreamTitle", "梦向入口标题"), f("bookingDreamSummary", "梦向入口说明", true), f("bookingRealityEyebrow", "现实入口英文小字"), f("bookingRealityTitle", "现实入口标题"), f("bookingRealitySummary", "现实入口说明", true), f("bookingIdeasEyebrow", "奇思妙想入口英文小字"), f("bookingIdeasTitle", "奇思妙想入口标题"), f("bookingIdeasSummary", "奇思妙想入口说明", true),
      f("bookingStep2Label", "第二步标签"), f("bookingStep2Title", "第二步标题"), f("bookingPrepare1Title", "准备卡 1 标题"), f("bookingPrepare1Text", "准备卡 1 说明", true), f("bookingPrepare2Title", "准备卡 2 标题"), f("bookingPrepare2Text", "准备卡 2 说明", true), f("bookingPrepare3Title", "准备卡 3 标题"), f("bookingPrepare3Text", "准备卡 3 说明", true),
      f("bookingPromoLabel", "活动步骤标签"), f("bookingPromoTitle", "活动步骤标题"), f("bookingContactLabel", "联系步骤标签"), f("bookingContactTitle", "联系步骤标题"),
      f("bookingBoundaryEyebrow", "接单范围英文小字"), f("bookingBoundaryTitle", "接单范围标题"), f("bookingBoundary1Label", "范围 1 标签"), f("bookingBoundary1Text", "范围 1 内容", true), f("bookingBoundary2Label", "范围 2 标签"), f("bookingBoundary2Text", "范围 2 内容", true), f("bookingBoundary3Label", "范围 3 标签"), f("bookingBoundary3Text", "范围 3 内容", true), f("bookingBoundary4Label", "范围 4 标签"), f("bookingBoundary4Text", "范围 4 内容", true),
    ],
  },
  {
    id: "notes",
    title: "抽一张",
    path: "/notes",
    note: "多牌堆抽卡页、洗牌提示、图像来源说明，以及留言区文案。",
    fields: [
      f("notesEyebrow", "页面英文小字"), f("notesTitle", "页面主标题"), f("notesLead", "页面说明", true), f("tipsLabel", "Tips 横幅标签"), f("tipsChange", "Tips 换一个按钮"), f("tipsAria", "Tips 无障碍名称"), f("deckEyebrow", "抽卡区英文小字"), f("deckTitle", "抽卡区标题"), f("deckLead", "抽卡区说明", true), f("deckAriaLabel", "抽卡区无障碍名称"), f("deckChooseLabel", "选择牌堆提示"), f("deckRwsLabel", "韦特牌堆名称"), f("deckRwsSubtitle", "韦特牌堆副标题"), f("deckLenormandLabel", "雷诺曼牌堆名称"), f("deckLenormandSubtitle", "雷诺曼牌堆副标题"), f("deckMarseilleLabel", "马赛牌堆名称"), f("deckMarseilleSubtitle", "马赛牌堆副标题"), f("deckThothLabel", "托特牌堆名称"), f("deckThothSubtitle", "托特牌堆副标题"), f("deckComingSoon", "未开放牌堆标签"), f("deckShuffle", "洗牌按钮"), f("deckShuffling", "洗牌中按钮"), f("deckShuffleHint", "洗牌动画提示", true), f("deckHint", "未抽时牌桌提示", true), f("deckAfterDrawHint", "抽牌后牌桌提示", true), f("deckDrawPrefix", "抽牌无障碍前缀"), f("deckDrawSuffix", "抽牌无障碍后缀"), f("factTitle", "牌面细节标题"), f("factReveal", "细节遮挡提示"), f("factHide", "收起细节文字"), f("factNext", "换一个细节按钮"), f("factEmpty", "暂无细节提示", true), f("deckSourceSummary", "图像来源折叠标题"), f("deckSourceRws", "韦特图源说明", true), f("deckSourceLenormand", "雷诺曼图源说明", true), f("deckSourceRwsLink", "韦特图源链接文字"), f("deckSourceLenormandLink", "雷诺曼图源链接文字"), f("spreadEyebrow", "牌阵小册英文小字"), f("spreadTitle", "牌阵小册标题"), f("spreadLead", "牌阵小册说明", true), f("spreadTarotTab", "塔罗牌阵分区按钮"), f("spreadLenormandTab", "雷诺曼牌阵分区按钮"), f("spreadSystemAria", "牌阵分区无障碍名称"), f("spreadBestLabel", "适合标签"), f("spreadAvoidLabel", "不太适合标签"), f("spreadPositionsLabel", "牌位标签"), f("spreadRelationLabel", "串联阅读标签"),
      f("guestbookEyebrow", "留言区英文小字"), f("guestbookTitle", "留言区标题"), f("guestbookLead", "留言区说明", true), f("guestbookNicknameLabel", "署名标签"), f("guestbookNicknamePlaceholder", "署名占位符"), f("guestbookMessageLabel", "留言标签"), f("guestbookMessagePlaceholder", "留言占位符"), f("guestbookSubmit", "发布按钮"), f("guestbookSending", "发送中按钮"), f("guestbookEmpty", "暂无留言提示", true), f("guestbookLoading", "留言加载中提示"), f("guestbookLoadError", "留言加载失败提示"), f("guestbookSent", "留言发布成功提示"), f("guestbookSendError", "留言发送失败提示"),
    ],
  },
  {
    id: "contact",
    title: "联系前确认",
    path: "/booking#contact",
    note: "预约须知弹窗和解锁联系方式后的全部可见提示。政策正文仍在“预约政策与版本”区编辑。",
    fields: [
      f("contactClosedTitle", "暂停接单标题"), f("contactClosedText", "暂停接单说明", true), f("contactUnlockButton", "查看须知按钮"), f("contactConfirmedPrefix", "已确认版本前缀"), f("contactReviewButton", "重新查看按钮"), f("contactPrimaryHeading", "推荐联系分组标题"), f("contactSocialHeading", "其他平台分组标题"), f("contactDetailEyebrow", "联系方式弹窗英文小字"), f("contactAccountLabel", "账号标签"), f("contactCopyGeneric", "复制账号按钮"), f("contactShowQr", "显示二维码按钮"), f("contactHideQr", "收起二维码按钮"), f("contactQrHint", "二维码使用提示", true), f("contactSaveQr", "保存二维码按钮"), f("contactSavingQr", "二维码保存中"), f("contactSavedQr", "二维码保存成功"), f("contactSaveQrRetry", "二维码保存失败"), f("contactWechatPlaceholder", "微信未填写提示"), f("contactCopyButton", "复制微信按钮"), f("contactCopiedButton", "复制成功文字"), f("contactOpenPrefix", "打开外链前缀"), f("contactLinkPending", "链接待补充"), f("contactNoChannelsTitle", "无渠道标题"), f("contactNoChannelsText", "无渠道说明", true), f("contactPolicyAll", "查看全部政策"),
      f("contactModalEyebrow", "弹窗英文小字"), f("contactModalTitle", "弹窗标题"), f("contactKey1Title", "提示 1 标题"), f("contactKey1Text", "提示 1 内容", true), f("contactKey2Title", "提示 2 标题"), f("contactKey2Text", "提示 2 内容", true), f("contactKey3Title", "提示 3 标题"), f("contactKey3Text", "提示 3 内容", true),
      f("contactServiceLink", "服务说明链接"), f("contactRiskLink", "风险提示链接"), f("contactPrivacyLink", "隐私政策链接"), f("contactRefundLink", "退款规则链接"), f("contactAdultConsent", "年龄勾选文字", false, "可使用 {age} 占位符"), f("contactTermsConsent", "服务/退款勾选文字", true), f("contactPrivacyConsent", "隐私勾选文字", true), f("contactDataNote", "隐私小字", true), f("contactAcceptButton", "确认按钮"), f("contactWechatTag", "微信渠道英文小字"), f("contactXianyuTag", "闲鱼渠道英文小字"), f("contactOtherTag", "其他渠道英文小字"), f("policyEffectiveLabel", "生效日期文字"), f("policyMissingDate", "日期未填写文字"),
    ],
  },
  {
    id: "policies",
    title: "政策页面外壳",
    path: "/policies",
    note: "政策正文之外的标题、卡片说明和导航文字。",
    fields: [
      f("policiesEyebrow", "总页英文小字"), f("policiesTitle", "总页标题"), f("policiesServiceLabel", "服务说明英文标签"), f("policiesServiceTitle", "服务说明标题"), f("policiesServiceText", "服务说明卡片描述", true), f("policiesRiskLabel", "风险提示英文标签"), f("policiesRiskTitle", "风险提示标题"), f("policiesRiskText", "风险提示卡片描述", true), f("policiesPrivacyLabel", "隐私政策英文标签"), f("policiesPrivacyTitle", "隐私政策标题"), f("policiesPrivacyText", "隐私政策卡片描述", true), f("policiesRefundLabel", "退款规则英文标签"), f("policiesRefundTitle", "退款规则标题"), f("policiesRefundText", "退款规则卡片描述", true), f("policiesReadAction", "阅读全文按钮"), f("policiesShortTitle", "一句话版本标题"), f("policiesShortText", "一句话版本内容", true), f("policyBackAll", "政策正文：返回链接"), f("policyGoBooking", "政策正文：预约链接"),
    ],
  },
];

export const copyFieldKeys = new Set(copyPages.flatMap((page) => page.fields.map((field) => field.key)));
