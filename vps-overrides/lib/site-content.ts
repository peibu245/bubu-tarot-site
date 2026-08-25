import { copyFile, mkdir, readFile, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { AvailabilitySettings, CardFact, ContactChannel, KnowledgeCard, PageTextStyle, PolicySettings, PriceItem, Promotion, RichContentBlock, SiteContent, SpreadGuide, TypographySettings } from "./content-types";
import { defaultContactChannels, defaultPolicies } from "./legal-defaults";
import { defaultCardFacts, defaultSpreadGuides } from "./educational-defaults";
import { defaultTypography, isFontChoice } from "./typography";

const CONTENT_VERSION = 17;

const defaultAvailability: AvailabilitySettings = {
  visible: true,
  title: "本周可约",
  responseText: "当前接单中，一般 24 小时内回复。",
  rushText: "急单请备注“加急”，会根据当天安排确认是否能接。",
  advanceDays: 30,
  weekly: [
    { weekday: 0, status: "rest", note: "" }, { weekday: 1, status: "rest", note: "" },
    { weekday: 2, status: "available", note: "" }, { weekday: 3, status: "available", note: "" },
    { weekday: 4, status: "rest", note: "" }, { weekday: 5, status: "available", note: "" },
    { weekday: 6, status: "limited", note: "" },
  ],
  overrides: [],
};

export const defaultPageText: Record<string, string> = {
  siteBrand: "不不tarot", navDream: "梦向解读", navReality: "现实问题咨询", navBooking: "预约入口", navNotes: "抽一张", navIdeas: "奇思妙想", navAction: "选择入口",
  footerIntro: "梦向解读、现实问题咨询与奇思妙想。以文字解读为主。", footerServiceTitle: "服务", footerBookingTitle: "预约", footerBookingLink: "价格与流程", footerNotesLink: "抽一张看看", footerCopyright: "© 2026 不不 Tarot",
  homeEyebrow: "BU BU · TAROT READER", homeTitle: "不不 Tarot｜塔罗解读", homeDeckline: "现实 · 梦向 · OC",
  homeLead: "不知道怎么开口也没关系，先发一句话过来就好。信息不够我会再问，不用急着写小作文。",
  homePrimaryAction: "查看价格与预约", homeSecondaryAction: "先看服务分类　↓", homeReaderName: "不不", homeReaderRole: "语音 & 文字",
  homeReaderNote1: "相信科学", homeReaderNote2: "事在人为", homeReaderNote3: "爱自己",
  homeServiceTitle: "你想问哪一类？", homeServiceLead: "梦向、现实、奇思妙想，不同类别不同价格。选和你问题最贴近的那个就好。",
  homeServiceEyebrow: "READING SERVICES", homeCardLink: "查看说明　↗", homeAboutEyebrow: "BU BU · ABOUT THE READING",
  homeDreamLabel: "DREAM READING", homeDreamTitle: "梦向解读", homeRealityLabel: "REALITY READING", homeRealityTitle: "现实问题咨询", homeIdeasLabel: "CURIOUS CORNER", homeIdeasTitle: "奇思妙想",
  homeDreamSummary: "梦占与传讯分开处理，也分别计价。", homeDreamDetail: "梦占侧重牌面、牌阵与整组关系；传讯侧重角色口吻、情绪和信息表达。",
  homeRealitySummary: "先补足现实背景，再安排问题和牌阵。", homeRealityDetail: "可看情感、人际、学业、工作、选择和阶段变化。",
  homeIdeasSummary: "OC、宠物，以及常规分类放不下的题目。", homeIdeasDetail: "偏向角色分析、创作辅助、纪念向内容或实验性玩法。",
  homeAboutTitle: "我会怎么读这组牌", homeAboutText: "我会先问清楚背景，再看单张牌、牌位和整组牌之间的关系。不同体系有不同读法时，我会告诉你这次为什么这样读。牌面里没有的信息，我不会硬编。",
  homeMethod1Title: "聊清楚背景", homeMethod1Text: "确认对象、时间范围和已经发生的事实。", homeMethod2Title: "安排牌阵", homeMethod2Text: "按问题复杂度选择牌阵和需要使用的牌。", homeMethod3Title: "一起解读", homeMethod3Text: "说明牌面依据、限制条件和可以参考的方向。",
  homeBookingTitle: "选好类型，把你想问的事说给我听。",
  homeOfferEyebrow: "CURRENT OFFERS", homeOfferTitle: "当前活动", homeOfferLink: "查看全部价格　→", homeNotesEyebrow: "SHORT NOTES", homeNotesTitle: "抽一张看看", homeNotesLink: "去抽一张　→",
  homeNote1Tag: "分类", homeNote1Title: "梦向解读和现实问题为什么分开", homeNote1Text: "两类问题依赖的信息不同，服务方式和价格也会分别展示。", homeNote2Tag: "提问", homeNote2Title: "怎么把问题写清楚", homeNote2Text: "对象、时间范围、已知事实和真正想问的点都很重要。", homeNote3Tag: "方法", homeNote3Title: "什么时候会用多套牌", homeNote3Text: "复杂主题会按需要组合牌阵和体系，不以牌组数量决定结论。", homeNoteLink: "阅读全文　↗", homeBookingEyebrow: "BOOK A READING", homeBookingAction: "查看预约流程",
  dreamEyebrow: "DREAM READING", dreamTitle: "梦向解读", dreamLead: "梦占与传讯使用独立项目，也分别计价。",
  dreamIntro: "梦向解读会结合作品世界观、角色性格、梦设信息与具体情境。梦占侧重牌面和牌阵；传讯侧重角色口吻与信息表达，两者不会混成同一种服务。",
  dreamSub1Title: "梦占", dreamSub1Text: "通过抽牌、牌位与整组关系展开解读，适合具体问题、情境反应、关系模式和对信息。", dreamSub2Title: "传讯", dreamSub2Text: "根据角色设定、情境与牌面整理角色向文字表达。它不等同于梦占，也不宣称真实通灵。",
  dreamContent1: "梦角的反应与心理", dreamContent2: "梦女、梦设与梦角对信息", dreamContent3: "日常、搞笑与雷霆问题", dreamContent4: "关系模式与角色一致性",
  dreamPrepare1: "作品名称与角色", dreamPrepare2: "梦设或梦女的必要信息", dreamPrepare3: "希望讨论的具体情境", dreamPrepare4: "需要避开的设定或内容",
  dreamPriceTitle: "项目与价格", dreamCtaTitle: "确认入口后再预约", dreamCtaText: "梦向与现实问题使用不同项目，发送问题时请注明入口。",
  dreamAboutEyebrow: "ABOUT THIS SERVICE", dreamAboutTitle: "这一类会怎么看", dreamContentHeading: "可看内容", dreamPrepareHeading: "预约时请准备", dreamPriceEyebrow: "PROJECTS & PRICING", dreamOfferEyebrow: "CURRENT OFFERS", dreamOfferTitle: "适用活动", dreamCtaEyebrow: "NEXT STEP", dreamCtaAction: "查看预约方式", dreamPendingTitle: "定价尚未公布", dreamPendingDream: "方案确定后会在这里单独更新，不沿用其他入口的价格。", dreamPendingMessage: "传讯会与梦占分开计价，确定方案后会在这里单独更新。",
  realityEyebrow: "REALITY CONSULTATION", realityTitle: "现实问题咨询", realityLead: "用于梳理现实处境、限制条件和下一步选择。",
  realityIntro: "现实问题咨询会结合已知背景、牌位和整组牌的逻辑，区分事实、感受、限制条件与可执行的选择。信息不足时会先补问。这里使用独立定价，不与梦向项目共用。",
  realityContent1: "情感与人际关系", realityContent2: "学业、工作与选择", realityContent3: "阶段变化与行动建议", realityContent4: "复杂问题的综合大牌阵",
  realityPrepare1: "已经发生的关键事实", realityPrepare2: "涉及的人物与关系", realityPrepare3: "希望查看的时间范围", realityPrepare4: "最需要解决的问题",
  realityPriceTitle: "项目与价格", realityCtaTitle: "确认入口后再预约", realityCtaText: "梦向与现实问题使用不同项目，发送问题时请注明入口。",
  realityAboutEyebrow: "ABOUT THIS SERVICE", realityAboutTitle: "这一类会怎么看", realityContentHeading: "可看内容", realityPrepareHeading: "预约时请准备", realityPriceEyebrow: "PROJECTS & PRICING", realityOfferEyebrow: "CURRENT OFFERS", realityOfferTitle: "适用活动", realityCtaEyebrow: "NEXT STEP", realityCtaAction: "查看预约方式", realityPendingTitle: "定价尚未公布", realityPendingText: "方案确定后会在这里单独更新，不沿用其他入口的价格。",
  footerPoliciesLink: "条款与隐私", statusOpen: "开放预约", statusClosed: "暂不接单", featuredNote: "当前主推项目", pricingPending: "定价中", promoNow: "现在", promoTbd: "另行通知", itemCountSuffix: "个项目", priceGroupDream: "梦占", priceGroupMessage: "传讯", priceGroupReality: "现实问题咨询", priceGroupIdeas: "奇思妙想",
  homeReaderEst: "2026年8月", homePortraitMark: "BU BU",
  dreamSub1Label: "CARD READING", dreamSub2Label: "MESSAGE",
  ideasEyebrow: "CURIOUS CORNER", ideasTitle: "奇思妙想", ideasLead: "OC、宠物，以及常规分类放不下的题目。", ideasIntro: "这类项目偏向角色分析、创作辅助、纪念向内容或娱乐体验。接单前会确认问题是否适合，以及需要使用的牌组和问法。", ideasAboutEyebrow: "ABOUT THIS SERVICE", ideasAboutTitle: "这一类会怎么看", ideasContentHeading: "可看内容", ideasContent1: "OC性格与关系探索", ideasContent2: "角色创作辅助", ideasContent3: "宠物主题与纪念向", ideasContent4: "新牌组与实验性玩法", ideasPrepareHeading: "预约时请准备", ideasPrepare1: "角色或对象的基础信息", ideasPrepare2: "世界观和关系设定", ideasPrepare3: "本次解读的用途", ideasPrepare4: "希望得到的内容形式", ideasPriceEyebrow: "PROJECTS & PRICING", ideasPriceTitle: "项目与价格", ideasOfferEyebrow: "CURRENT OFFERS", ideasOfferTitle: "适用活动", ideasCtaEyebrow: "NEXT STEP", ideasCtaTitle: "想好了再来找我", ideasCtaText: "把你想玩的题目和必要设定发来就行。", ideasCtaAction: "查看预约方式", ideasPendingTitle: "定价尚未公布", ideasPendingText: "方案确定后会在这里单独更新。",
  bookingEyebrow: "CHOOSE AN ENTRANCE", bookingTitle: "选择预约入口", bookingLead: "梦向解读与现实问题咨询使用不同的项目和价格。先进入对应页面看清楚，再决定要不要预约。", bookingStep1Label: "第一步", bookingStep1Title: "选择服务类型", bookingEntryAction: "进入查看　↗", bookingDreamEyebrow: "DREAM READING", bookingDreamTitle: "梦向解读", bookingDreamSummary: "梦占和传讯分别展示、分别计价。可以先进去看看两种服务的区别。", bookingRealityEyebrow: "REALITY CONSULTATION", bookingRealityTitle: "现实问题咨询", bookingRealitySummary: "新客单问、常规单问、深入解析与综合大牌阵都放在这个入口。", bookingIdeasEyebrow: "CURIOUS CORNER", bookingIdeasTitle: "奇思妙想", bookingIdeasSummary: "OC、宠物、角色创作辅助，以及暂时不适合放进常规分类的题目。", bookingStep2Label: "第二步", bookingStep2Title: "准备问题", bookingPrepare1Title: "问题类型", bookingPrepare1Text: "注明选择梦向解读（梦占或传讯）、现实问题咨询，还是奇思妙想。", bookingPrepare2Title: "必要背景", bookingPrepare2Text: "写明对象、时间范围，以及已经发生的关键事实或必要设定。", bookingPrepare3Title: "真正想问的点", bookingPrepare3Text: "尽量避免只写“看看感情”或“看看未来”这种特别宽的说法。", bookingPromoLabel: "当前", bookingPromoTitle: "优惠活动", bookingContactLabel: "最后一步", bookingContactTitle: "联系不不", bookingBoundaryEyebrow: "BEFORE BOOKING", bookingBoundaryTitle: "接单范围", bookingBoundary1Label: "可以讨论：", bookingBoundary1Text: "情感、人际、学业、工作、阶段变化、梦角与梦设、OC及其他娱乐向主题。", bookingBoundary2Label: "暂不接：", bookingBoundary2Text: "生死、走失、重大疾病诊断、法律结论、投资或赌博决策。", bookingBoundary3Label: "服务说明：", bookingBoundary3Text: "卡牌作为图像、象征与叙事媒介，用于娱乐体验、角色创作和现实问题梳理；不提供通灵、改运或结果保证。", bookingBoundary4Label: "需要知道：", bookingBoundary4Text: "解读基于当前信息，现实条件变化后，结果也可能变化。",
  notesEyebrow: "DRAW A CARD", notesTitle: "抽一张看看", notesLead: "从牌背里随手选一张。抽到的牌不会在这一轮里重复；主动洗牌后才重新开始。", deckEyebrow: "PICK A DECK", deckTitle: "选一副牌，随手抽一张", deckLead: "不用把整副牌挤进屏幕。你看到的是摊开的一个窗口，背后仍然按完整牌组无放回抽取。", deckHint: "点牌扇里的任意一张。", deckDrawAgain: "再点一张也可以", deckResultEmpty: "还没有翻牌。", deckChange: "换一张　↻", deckCardFront: "NOTE", deckCountSuffix: "条科普可抽取", deckAriaLabel: "抽一张看看", deckChooseLabel: "选择牌堆", deckRwsLabel: "韦特–史密斯", deckRwsSubtitle: "Waite–Smith · 1910", deckLenormandLabel: "雷诺曼", deckLenormandSubtitle: "B. Dondorf · 19th c.", deckKnowledgeLabel: "知识牌堆", deckKnowledgeSubtitle: "BU BU'S NOTES", deckMarseilleLabel: "马赛", deckMarseilleSubtitle: "历史公版整理中", deckThothLabel: "托特", deckThothSubtitle: "画面授权暂不启用", deckComingSoon: "准备中", deckShuffle: "洗牌", deckShuffling: "洗牌中…", deckShuffleHint: "收牌、洗散，再重新摊开。", deckAfterDrawHint: "想继续就再点一张；主动洗牌会把本轮已经抽过的牌重新放回去。", deckDrawPrefix: "抽取", deckDrawSuffix: "中的一张", deckKnowledgeFoot: "BU BU · NOTE", tipsLabel: "TIPS", tipsChange: "换一个 ↻", tipsAria: "随机小提示", factTitle: "你知道吗？", factReveal: "点一下揭开", factHide: "收起", factNext: "换一个细节 ↻", factEmpty: "这张牌的小细节还在整理中。", deckSourceSummary: "图像来源与公版说明", deckSourceRws: "韦特–史密斯：Pamela Colman Smith 绘制的早期 Waite–Smith 历史扫描，来自 Wikimedia Commons 公有领域档案。", deckSourceLenormand: "雷诺曼：使用 19 世纪 B. Dondorf 的 36 张历史公版图像；原件藏于大英博物馆。本站基于 Wikimedia Commons 公版机械扫描做非生成式网页整理：保留人物、场景与扑克嵌图，只统一顶部牌号版式并提升网页显示清晰度。", deckSourceRwsLink: "Waite–Smith source ↗", deckSourceLenormandLink: "B. Dondorf Lenormand source ↗", spreadEyebrow: "SPREAD NOTES", spreadTitle: "牌阵小册", spreadLead: "牌阵不是越大越准。塔罗和雷诺曼的阅读逻辑不同，所以先分开看。", spreadTarotTab: "塔罗牌阵", spreadLenormandTab: "雷诺曼牌阵", spreadSystemAria: "选择牌阵体系", spreadBestLabel: "适合", spreadAvoidLabel: "不太适合", spreadPositionsLabel: "牌位", spreadRelationLabel: "怎么串起来看", spreadOpen: "展开看看", spreadClose: "收起",
  guestbookEyebrow: "MESSAGE BOARD", guestbookTitle: "留一页话", guestbookLead: "可以聊卡牌、分享抽卡感受，或留下想看的内容。留言会公开显示，请使用昵称，不要写联系方式、私人对话或他人隐私，也请避免露骨、攻击性或引流内容。每位访客每天最多 10 条。", guestbookNicknameLabel: "署名（可选）", guestbookNicknamePlaceholder: "匿名访客", guestbookMessageLabel: "留言", guestbookMessagePlaceholder: "写下你的话…", guestbookSubmit: "发布留言", guestbookSending: "发送中…", guestbookEmpty: "还没有留言。你可以写第一条。", guestbookLoading: "加载留言中…", guestbookLoadError: "留言板暂时无法加载。", guestbookSent: "已发布。今天还可以再留几条。", guestbookSendError: "发送失败，请稍后重试。",
   contactPrimaryHeading: "选择你习惯的联系方式", contactSocialHeading: "其他可以找到我的地方", contactDetailEyebrow: "CONTACT", contactAccountLabel: "账号", contactCopyGeneric: "复制账号", contactShowQr: "显示二维码", contactHideQr: "收起二维码", contactQrHint: "电脑端可以直接扫码；手机端可以点“保存二维码”，若浏览器没有直接写入相册，也可以长按二维码图片保存。", contactSaveQr: "保存二维码", contactSavingQr: "保存中…", contactSavedQr: "已保存 ✓", contactSaveQrRetry: "保存失败，点此重试", contactClosedTitle: "当前暂不接单", contactClosedText: "预约重新开放后，这里会显示可用联系方式。", contactUnlockButton: "阅读预约须知并查看联系方式　↗", contactConfirmedPrefix: "已确认", contactReviewButton: "重新查看预约须知", contactWechatPlaceholder: "微信号待补充", contactCopyButton: "复制微信号", contactCopiedButton: "已复制 ✓", contactOpenPrefix: "打开", contactLinkPending: "链接待补充", contactNoChannelsTitle: "联系方式正在整理", contactNoChannelsText: "你已经完成预约须知确认，但目前没有启用的联系渠道。", contactPolicyAll: "查看全部政策", contactModalEyebrow: "BEFORE CONTACT", contactModalTitle: "在联系不不之前", contactKey1Title: "服务边界", contactKey1Text: "卡牌阅读用于娱乐、自我探索、角色创作与思路整理，不保证预测、通灵、改运或现实结果。", contactKey2Title: "高风险问题", contactKey2Text: "重大疾病、生死、走失、法律结论、投资与赌博决策不作为个人解读范围。", contactKey3Title: "隐私提醒", contactKey3Text: "只提供完成咨询必要的信息；截图请尽量遮挡第三人的姓名、手机号、账号和其他无关信息。", contactServiceLink: "服务说明 ↗", contactRiskLink: "风险提示 ↗", contactPrivacyLink: "隐私政策 ↗", contactRefundLink: "退款规则 ↗", contactAdultConsent: "我已年满 {age} 周岁。", contactTermsConsent: "我已阅读并同意《服务说明》《退款规则》，并已知悉《风险提示》。", contactPrivacyConsent: "我已阅读《隐私政策》，了解咨询过程中必要信息的处理方式。", contactDataNote: "请尽量不要提供与咨询无关的真实姓名、身份证号、精确住址等信息。网站只在浏览器本地记录本次政策版本与确认时间，用于减少重复提示。", contactAcceptButton: "确认并查看联系方式", contactWechatTag: "WECHAT", contactXianyuTag: "GOOFISH", contactOtherTag: "CONTACT", policyEffectiveLabel: "生效日期", policyMissingDate: "未填写",
  policiesEyebrow: "BOOKING POLICIES", policiesTitle: "预约前说明", policiesServiceLabel: "SERVICE", policiesServiceTitle: "服务说明", policiesServiceText: "服务性质、接单范围、服务方式与年龄门槛。", policiesRiskLabel: "NOTICE", policiesRiskTitle: "风险提示", policiesRiskText: "卡牌阅读的解释边界，以及不应交给塔罗决定的事项。", policiesPrivacyLabel: "PRIVACY", policiesPrivacyTitle: "隐私政策", policiesPrivacyText: "会接触哪些信息、为什么需要，以及如何减少不必要的信息提供。", policiesRefundLabel: "REFUND", policiesRefundTitle: "退款规则", policiesRefundText: "未开始、进行中、已完成和无法完成服务时分别如何处理。", policiesReadAction: "阅读全文　↗", policiesShortTitle: "一句话版本", policiesShortText: "塔罗可以用来娱乐、梳理想法与创作，但不保证预测或现实结果；付费前会明确服务范围，个人信息只收必要部分，退款按照实际履约进度处理。", policyBackAll: "← 返回全部预约说明", policyGoBooking: "前往预约入口 →",
};
const DATA_FILE = process.env.BUBU_DATA_FILE || "/data/site-content.json";

export const defaultContent: SiteContent = {
  contentVersion: CONTENT_VERSION,
  bookingsOpen: true,
  availability: defaultAvailability,
  priceNotice: "现实问题咨询价格以页面为准。问题跨度较大或涉及多个独立主题时，会在接单前确认是否需要拆单。",
  dreamPriceNotice: "梦占与传讯分别计价，具体方案正在整理中，暂不展示价格。",
  contactNote: "预约时请发送：问题类型 + 想问的问题 + 必要背景",
  contactLabel: "查看当前项目",
  contactUrl: "",
  contactChannels: defaultContactChannels,
  policies: defaultPolicies,
  prices: [
    { id: "reality-first", section: "现实问题咨询", title: "新客单问", description: "首次预约现实问题咨询可用。1个明确问题，通常抽取3–5张牌；包含一次原题范围内的补充说明。每人限购一次。", price: "60", unit: "元 / 1问", badge: "FIRST READING", delivery: "", turnaround: "", followUp: "", suitableFor: "", status: "available", visible: true, featured: false },
    { id: "reality-one", section: "现实问题咨询", title: "常规单问", description: "1个独立问题，通常抽取3–5张牌。结合必要背景、牌位和整组关系进行解读。", price: "88", unit: "元 / 1问", badge: "ONE QUESTION", delivery: "", turnaround: "", followUp: "", suitableFor: "", status: "available", visible: true, featured: false },
    { id: "reality-deep", section: "现实问题咨询", title: "1–3问深入解析", description: "针对1–3个明确问题进行深入解析，按复杂度安排牌阵。问题跨度较大时，会在接单前确认是否需要拆分。", price: "188", unit: "元 / 1–3问", badge: "DEEP READING", delivery: "", turnaround: "", followUp: "", suitableFor: "", status: "available", visible: true, featured: true },
    { id: "reality-custom", section: "现实问题咨询", title: "综合大牌阵", description: "用于人物关系复杂、信息量较大，或需要比较多条发展路径的主题。先梳理背景和核心问题，以大牌阵建立整体结构，再用小牌阵补充关键细节；可按需要组合韦特、透特、马赛、雷诺曼等体系进行交叉参照。接单前确认解读范围，包含一次原主题内的补充说明。", price: "518", unit: "元 / 复杂主题", badge: "CUSTOM SPREAD", delivery: "", turnaround: "", followUp: "", suitableFor: "", status: "available", visible: true, featured: false },
  ],
  promotions: [
    { id: "hundred", scope: "全站", title: "自带牌阵", description: "自己抽好牌，只需要解读服务，立享八折。", badge: "自己动手丰衣足食", startsAt: "", endsAt: "", active: true },
  ],
  knowledgeCards: [
    { id: "tip-future", tag: "Tips", title: "未来不是定稿", body: "塔罗不能完美预测未来，更适合根据当下情况观察可能的发展方向。", visible: true },
    { id: "card-question", tag: "Tips", title: "先把问题缩小", body: "对象、时间范围、已经发生的事实，以及真正想问的点，会比一句“看看感情”更容易安排牌阵。", visible: true },
    { id: "card-reversal", tag: "Tips", title: "逆位不等于坏牌", body: "逆位可能表示延迟、受阻、内化、失衡或表达方式改变，需要和牌位、前后牌、现实背景一起看。", visible: true },
    { id: "tip-repeat", tag: "Tips", title: "别为了不喜欢答案一直重抽", body: "同一个问题短时间内反复抽牌，信息很容易越抽越乱；先把第一组牌读完通常更有用。", visible: true },
    { id: "card-boundary", tag: "Tips", title: "有些事不交给卡牌", body: "重大疾病、生死、走失、法律结论、投资和赌博决策，不作为解读范围。", visible: true },
    { id: "tip-lenormand", tag: "Tips", title: "雷诺曼不是简化版塔罗", body: "两套牌的阅读语言不同；雷诺曼更依赖相邻牌组成短语，不能把同名图像直接一一套用。", visible: true },
    { id: "tip-spread-size", tag: "Tips", title: "牌阵不是越大越准", body: "更多牌只是增加观察维度。问题很小却硬塞进大牌阵，反而更容易把重点冲淡。", visible: true },
    { id: "tip-clarifier", tag: "Tips", title: "补牌要解决具体疑问", body: "补牌更适合澄清某个牌位或冲突点，而不是因为第一组结果不好听就一直抽到满意为止。", visible: true },
    { id: "card-dream", tag: "Tips", title: "梦向与现实分开", body: "梦向解读依赖作品设定、角色逻辑和梦设信息；现实问题咨询则需要现实背景和可观察条件。", visible: true },
    { id: "card-record", tag: "Tips", title: "给解读留一份记录", body: "保留原始问题、抽牌结果和当时背景，之后对照现实发展，通常比只记住一句结论更有用。", visible: true },
  ],
  cardFacts: defaultCardFacts,
  spreadGuides: defaultSpreadGuides,
  pageText: defaultPageText,
  pageTextStyles: {},
  richBlocks: [],
  typography: { ...defaultTypography },
};

function isFileError(error: unknown, code: string): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === code);
}

function isContentBackup(name: string): boolean {
  return name.startsWith("site-content-") && name.endsWith(".json");
}

async function backupRows(directory: string) {
  const names = (await readdir(directory)).filter(isContentBackup);
  const rows = await Promise.all(names.map(async (name) => ({ name, mtimeMs: (await stat(join(directory, name))).mtimeMs })));
  return rows.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

async function readLatestValidBackup(): Promise<SiteContent | null> {
  const directory = join(dirname(DATA_FILE), "backups");
  try {
    for (const { name } of await backupRows(directory)) {
      try { return cleanContent(JSON.parse(await readFile(join(directory, name), "utf8"))); }
      catch { /* Skip a damaged backup and try the next one. */ }
    }
  } catch (error) {
    if (!isFileError(error, "ENOENT")) throw error;
  }
  return null;
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const payload = await readFile(DATA_FILE, "utf8");
    const content = cleanContent(JSON.parse(payload));
    if (content.contentVersion < CONTENT_VERSION) {
      const migrated = migrateTerminology(content);
      await writeContent(migrated, false);
      return migrated;
    }
    return content;
  } catch (error) {
    const recovered = await readLatestValidBackup();
    if (recovered) return recovered;
    if (isFileError(error, "ENOENT")) return defaultContent;
    throw error;
  }
}

export type ContentRevision = { id: string; createdAt: string; updatedBy: string };

export async function saveSiteContent(content: unknown, _editor: string): Promise<SiteContent> {
  const clean = cleanContent(content);
  clean.contentVersion = CONTENT_VERSION;
  await writeContent(clean, true);
  return clean;
}

export async function listSiteContentHistory(): Promise<ContentRevision[]> {
  const directory = join(dirname(DATA_FILE), "backups");
  try {
    const rows = await backupRows(directory);
    return rows.slice(0, 30).map(({ name, mtimeMs }) => ({ id: name, createdAt: new Date(mtimeMs).toISOString(), updatedBy: "private-admin" }));
  } catch {
    return [];
  }
}

export async function restoreSiteContentHistory(id: string, editor: string): Promise<SiteContent> {
  if (!/^[A-Za-z0-9._-]+\.json$/.test(id)) throw new Error("invalid revision");
  const file = join(dirname(DATA_FILE), "backups", id);
  const payload = await readFile(file, "utf8");
  return saveSiteContent(JSON.parse(payload), editor);
}

async function writeContent(content: SiteContent, createBackup: boolean) {
  const directory = dirname(DATA_FILE);
  const backupDirectory = join(directory, "backups");
  await mkdir(directory, { recursive: true });

  if (createBackup) {
    await mkdir(backupDirectory, { recursive: true });
    const stamp = new Date().toISOString().replaceAll(":", "-");
    try {
      await copyFile(DATA_FILE, join(backupDirectory, `site-content-${stamp}.json`));
      await trimBackups(backupDirectory);
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
      // The very first save has no source file to back up yet.
    }
  }

  const temporary = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(content, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporary, DATA_FILE);
}

async function trimBackups(directory: string) {
  const rows = await backupRows(directory);
  await Promise.all(rows.slice(30).map(({ name }) => unlink(join(directory, name))));
}

function text(value: unknown, max = 180): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function contactUrl(value: unknown): string {
  const url = text(value, 500);
  return /^(https?:\/\/|mailto:|weixin:\/\/)/i.test(url) ? url : "";
}

function blockUrl(value: unknown): string {
  const url = typeof value === "string" ? value.trim().slice(0, 1200) : "";
  return /^(https?:\/\/|\/|#)/i.test(url) ? url : "";
}

function replaceLegacyTerms(value: string): string {
  return value
    .replaceAll("梦向卡牌", "梦占")
    .replaceAll("现占", "现实问题咨询")
    .replaceAll("现实议题", "现实问题咨询")
    .replaceAll("占卜", "卡牌解读");
}

function normalizeSection(value: unknown): PriceItem["section"] {
  if (value === "梦占" || value === "梦向卡牌") return "梦占";
  if (value === "传讯") return "传讯";
  if (value === "现占" || value === "现实议题" || value === "现实问题咨询") return "现实问题咨询";
  if (value === "奇思妙想") return "奇思妙想";
  return "梦占";
}

function normalizePromotionScope(value: unknown, title: string, description: string): Promotion["scope"] {
  if (value === "梦向解读" || value === "梦占" || value === "梦向卡牌" || value === "传讯") return "梦向解读";
  if (value === "现实问题咨询" || value === "现实议题" || value === "现占") return "现实问题咨询";
  if (value === "奇思妙想") return "奇思妙想";
  if (value === "全站") return "全站";
  return /梦角|梦设|梦向|传讯/.test(`${title}${description}`) ? "梦向解读" : "全站";
}

function migrateTerminology(content: SiteContent): SiteContent {
  // Preserve reader-authored values, but move untouched V8 defaults to the new V9 draw-page wording.
  const pageText = { ...content.pageText };
  const replaceIfUntouched = (key: string, previous: string, next: string) => { if (pageText[key] === previous) pageText[key] = next; };
  replaceIfUntouched("navNotes", "小科普", "抽一张");
  replaceIfUntouched("footerNotesLink", "预约前阅读", "抽一张看看");
  replaceIfUntouched("homeNotesTitle", "预约前的小科普", "抽一张看看");
  replaceIfUntouched("homeNotesLink", "查看全部　→", "去抽一张　→");
  replaceIfUntouched("notesEyebrow", "BU BU'S NOTES", "DRAW A CARD");
  replaceIfUntouched("notesTitle", "抽卡小科普", "抽一张看看");
  replaceIfUntouched("notesLead", "不做逐张牌义词典。你可以从牌扇里随手点一张，抽出一条预约前可能用得上的说明。", "选一副牌，随手抽一张。韦特–史密斯与雷诺曼使用历史公版图像；知识牌堆会翻出一条随机小科普。");
  replaceIfUntouched("deckEyebrow", "DRAW A NOTE", "PICK A DECK");
  replaceIfUntouched("deckTitle", "从 78 张牌里随手抽一张", "选一副牌，随手抽一张");
  replaceIfUntouched("deckLead", "这 78 张牌只是抽取动画，不和具体科普绑定。你点哪一张都可以，翻开后会随机出现一条小科普。", "牌面会直接翻在牌桌中央。想重新整理手气，可以先洗牌。");
  replaceIfUntouched("notesLead", "选一副牌，随手抽一张。韦特–史密斯与雷诺曼使用历史公版图像；知识牌堆会翻出一条随机小科普。", defaultPageText.notesLead);
  replaceIfUntouched("deckLead", "牌面会直接翻在牌桌中央。想重新整理手气，可以先洗牌。", defaultPageText.deckLead);
  replaceIfUntouched("deckLenormandSubtitle", "Game of Hope · 1799", defaultPageText.deckLenormandSubtitle);
  replaceIfUntouched("deckSourceLenormand", "雷诺曼：1799 年 Johann Kaspar Hechtel《Das Spiel der Hofnung（希望游戏）》36 张，原件来自大英博物馆；图像在 Wikimedia Commons 标记为公有领域。", defaultPageText.deckSourceLenormand);
  replaceIfUntouched("deckSourceLenormand", "雷诺曼：19 世纪 B. Dondorf 出版的 36 张 Mlle. Lenormand fortune-telling cards；原件藏于大英博物馆，本站使用 Wikimedia Commons 标记为公有领域的机械扫描并切分为单张。", defaultPageText.deckSourceLenormand);

  if (content.contentVersion < 15) {
    Object.assign(pageText, {
      homeTitle: "不不 Tarot｜塔罗解读",
      homeDeckline: "现实 · 梦向 · OC",
      homeLead: "不知道怎么开口也没关系，先发一句话过来就好。信息不够我会再问，不用急着写小作文。",
      homeReaderEst: "2026年8月",
      homeReaderRole: "语音 & 文字",
      homeReaderNote1: "相信科学",
      homeReaderNote2: "事在人为",
      homeReaderNote3: "爱自己",
      homeServiceTitle: "你想问哪一类？",
      homeServiceLead: "梦向、现实、奇思妙想，不同类别不同价格。选和你问题最贴近的那个就好。",
      homeAboutEyebrow: "BU BU · ABOUT THE READING",
      homeAboutTitle: "我会怎么读这组牌",
      homeAboutText: "我会先问清楚背景，再看单张牌、牌位和整组牌之间的关系。不同体系有不同读法时，我会告诉你这次为什么这样读。牌面里没有的信息，我不会硬编。",
      homeMethod1Title: "聊清楚背景",
      homeMethod1Text: "确认对象、时间范围和已经发生的事实。",
      homeMethod2Title: "安排牌阵",
      homeMethod2Text: "按问题复杂度选择牌阵和需要使用的牌。",
      homeMethod3Title: "一起解读",
      homeMethod3Text: "说明牌面依据、限制条件和可以参考的方向。",
      homeBookingTitle: "选好类型，把你想问的事说给我听。",
      guestbookLead: "可以聊卡牌、分享抽卡感受，或留下想看的内容。留言会公开显示，请使用昵称，不要写联系方式、私人对话或他人隐私，也请避免露骨、攻击性或引流内容。每位访客每天最多 10 条。",
      footerCopyright: "© 2026 不不 Tarot",
    });
  }

  // V8 expanded the contact center; known channels only receive supplied defaults when an old field is blank.
  const tipIds = new Set(content.knowledgeCards.map((tip) => tip.id));
  const v10Tips: KnowledgeCard[] = [
    { id: "tip-future", tag: "Tips", title: "未来不是定稿", body: "塔罗不能完美预测未来，更适合根据当下情况观察可能的发展方向。", visible: true },
    { id: "tip-repeat", tag: "Tips", title: "别为了不喜欢答案一直重抽", body: "同一个问题短时间内反复抽牌，信息很容易越抽越乱；先把第一组牌读完通常更有用。", visible: true },
    { id: "tip-lenormand", tag: "Tips", title: "雷诺曼不是简化版塔罗", body: "两套牌的阅读语言不同；雷诺曼更依赖相邻牌组成短语，不能把同名图像直接一一套用。", visible: true },
    { id: "tip-spread-size", tag: "Tips", title: "牌阵不是越大越准", body: "更多牌只是增加观察维度。问题很小却硬塞进大牌阵，反而更容易把重点冲淡。", visible: true },
    { id: "tip-clarifier", tag: "Tips", title: "补牌要解决具体疑问", body: "补牌更适合澄清某个牌位或冲突点，而不是因为第一组结果不好听就一直抽到满意为止。", visible: true },
  ];
  const knowledgeCards = [...content.knowledgeCards, ...v10Tips.filter((tip) => !tipIds.has(tip.id))];

  const spreadIds = new Set(content.spreadGuides.map((guide) => guide.id));
  const spreadGuides = [
    ...content.spreadGuides,
    ...defaultSpreadGuides.filter((guide) => guide.system === "lenormand" && !spreadIds.has(guide.id)),
  ].slice(0, 30);

  const existing = new Map(content.contactChannels.map((channel) => [channel.id, channel]));
  const merged = defaultContactChannels.map((fallback) => {
    const current = existing.get(fallback.id) || content.contactChannels.find((channel) => channel.kind === fallback.kind);
    if (!current) return { ...fallback };
    const oldGenericLabels = new Set(["微信咨询", "闲鱼咨询 / 交易", "其他联系方式"]);
    const oldSetupNotes = new Set(["填写微信号并开启后，访客确认预约须知即可复制。", "有可用的闲鱼主页或商品链接时再开启。"]);
    return {
      ...fallback,
      ...current,
      label: !current.label || oldGenericLabels.has(current.label) ? fallback.label : current.label,
      detail: current.detail || fallback.detail,
      url: current.url || fallback.url,
      note: !current.note || oldSetupNotes.has(current.note) ? fallback.note : current.note,
      qrImage: current.qrImage || fallback.qrImage,
      badge: current.badge || fallback.badge,
      group: current.group || fallback.group,
      enabled: current.enabled || fallback.enabled,
    };
  });
  const knownIds = new Set(merged.map((channel) => channel.id));
  const extras = content.contactChannels.filter((channel) => !knownIds.has(channel.id) && !defaultContactChannels.some((fallback) => fallback.kind === channel.kind));
  const promotions = content.promotions.map((promotion) => promotion.id === "hundred" || promotion.title === "自带牌阵"
    ? { ...promotion, scope: "全站" as const, title: "自带牌阵", description: "自己抽好牌，只需要解读服务，立享八折。", badge: "自己动手丰衣足食" }
    : promotion);
  return {
    ...content,
    contactNote: content.contentVersion < 15 ? "预约时请发送：问题类型 + 想问的问题 + 必要背景" : content.contactNote,
    pageText,
    promotions,
    knowledgeCards,
    spreadGuides,
    contactChannels: [...merged, ...extras].slice(0, 12),
    contentVersion: CONTENT_VERSION,
  };
}

function cleanPrice(value: unknown, index: number): PriceItem {
  const item = (value && typeof value === "object" ? value : {}) as Partial<PriceItem>;
  return {
    id: text(item.id, 64) || `price-${index}`,
    section: normalizeSection(item.section),
    title: text(item.title, 40) || "未命名项目",
    description: text(item.description, 360),
    price: text(item.price, 24) || "待定",
    unit: text(item.unit, 30),
    badge: text(item.badge, 32),
    delivery: text(item.delivery, 80),
    turnaround: text(item.turnaround, 80),
    followUp: text(item.followUp, 120),
    suitableFor: text(item.suitableFor, 160),
    status: item.status === "paused" || item.status === "waitlist" ? item.status : "available",
    visible: item.visible !== false,
    featured: item.featured === true,
  };
}

function cleanPromotion(value: unknown, index: number): Promotion {
  const item = (value && typeof value === "object" ? value : {}) as Partial<Promotion>;
  const title = text(item.title, 60) || "未命名活动";
  const description = text(item.description, 220);
  return {
    id: text(item.id, 64) || `promo-${index}`,
    scope: normalizePromotionScope(item.scope, title, description),
    title,
    description,
    badge: text(item.badge, 32),
    startsAt: text(item.startsAt, 10),
    endsAt: text(item.endsAt, 10),
    active: item.active !== false,
    desktopBadgeSize: numberWithin(item.desktopBadgeSize, 14, 10, 28),
    desktopTitleSize: numberWithin(item.desktopTitleSize, 34, 20, 56),
    desktopDescriptionSize: numberWithin(item.desktopDescriptionSize, 18, 12, 30),
  };
}

function cleanAvailability(value: unknown): AvailabilitySettings {
  const item = value && typeof value === "object" ? value as Partial<AvailabilitySettings> : {};
  const statuses = new Set(["available", "limited", "full", "rest"]);
  const weeklySource = Array.isArray(item.weekly) ? item.weekly : [];
  const weekly = defaultAvailability.weekly.map((fallback) => {
    const raw = weeklySource.find((entry) => entry && typeof entry === "object" && Number((entry as { weekday?: unknown }).weekday) === fallback.weekday) as Partial<typeof fallback> | undefined;
    return { weekday: fallback.weekday, status: raw && statuses.has(String(raw.status)) ? raw.status as typeof fallback.status : fallback.status, note: text(raw?.note, 30) };
  });
  const overrides = Array.isArray(item.overrides) ? item.overrides.slice(0, 120).map((raw) => {
    const row = raw && typeof raw === "object" ? raw as { date?: unknown; status?: unknown; note?: unknown } : {};
    return { date: text(row.date, 10), status: statuses.has(String(row.status)) ? row.status as AvailabilitySettings["overrides"][number]["status"] : "rest" as const, note: text(row.note, 30) };
  }).filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date)) : [];
  return {
    visible: item.visible !== false,
    title: text(item.title, 30) || defaultAvailability.title,
    responseText: text(item.responseText, 180) || defaultAvailability.responseText,
    rushText: text(item.rushText, 180) || defaultAvailability.rushText,
    advanceDays: numberWithin(item.advanceDays, 30, 14, 45),
    weekly,
    overrides,
  };
}

function cleanKnowledgeCard(value: unknown, index: number): KnowledgeCard {
  const item = (value && typeof value === "object" ? value : {}) as Partial<KnowledgeCard>;
  return {
    id: text(item.id, 64) || `knowledge-${index}`,
    title: text(item.title, 60) || "未命名卡片",
    body: text(item.body, 360),
    tag: text(item.tag, 20) || "小科普",
    visible: item.visible !== false,
  };
}

function cleanCardFact(value: unknown, index: number): CardFact {
  const item = (value && typeof value === "object" ? value : {}) as Partial<CardFact>;
  const deck: CardFact["deck"] = item.deck === "lenormand" ? "lenormand" : "rws";
  return {
    id: text(item.id, 80) || `fact-${index}`,
    deck,
    cardId: text(item.cardId, 80),
    text: text(item.text, 760),
    visible: item.visible !== false,
  };
}

function cleanSpreadGuide(value: unknown, index: number): SpreadGuide {
  const item = (value && typeof value === "object" ? value : {}) as Partial<SpreadGuide>;
  const layouts: SpreadGuide["layout"][] = ["line3", "timeline3", "choice5", "relationship5", "inner5", "celtic10", "line5", "grid9", "grandtableau36"];
  return {
    id: text(item.id, 80) || `spread-${index}`,
    system: item.system === "lenormand" ? "lenormand" : "tarot",
    title: text(item.title, 80) || "未命名牌阵",
    subtitle: text(item.subtitle, 100),
    summary: text(item.summary, 800),
    bestFor: text(item.bestFor, 800),
    avoidFor: text(item.avoidFor, 800),
    positions: Array.isArray(item.positions) ? item.positions.slice(0, 40).map((row) => text(row, 240)).filter(Boolean) : [],
    relation: text(item.relation, 1000),
    layout: layouts.includes(item.layout as SpreadGuide["layout"]) ? item.layout as SpreadGuide["layout"] : "line3",
    visible: item.visible !== false,
  };
}

function cleanContactChannel(value: unknown, index: number): ContactChannel {
  const item = (value && typeof value === "object" ? value : {}) as Partial<ContactChannel>;
  const kinds: ContactChannel["kind"][] = ["wechat", "xianyu", "qq", "xiaohongshu", "douyin", "link"];
  const kind: ContactChannel["kind"] = kinds.includes(item.kind as ContactChannel["kind"]) ? item.kind as ContactChannel["kind"] : "link";
  const names: Record<ContactChannel["kind"], string> = { wechat: "微信", xianyu: "闲鱼", qq: "QQ", xiaohongshu: "小红书", douyin: "抖音", link: "联系方式" };
  return {
    id: text(item.id, 64) || `contact-${index}`,
    kind,
    label: text(item.label, 50) || names[kind],
    detail: text(item.detail, 160),
    url: contactUrl(item.url),
    note: text(item.note, 240),
    qrImage: blockUrl(item.qrImage),
    badge: text(item.badge, 24),
    group: item.group === "social" ? "social" : "booking",
    enabled: item.enabled === true,
  };
}

function fallbackContactChannels(item: Partial<SiteContent>): ContactChannel[] {
  const channels = defaultContactChannels.map((channel) => ({ ...channel }));
  const legacyUrl = contactUrl(item.contactUrl);
  if (legacyUrl) {
    channels.push({
      id: "legacy-contact",
      kind: "link",
      label: text(item.contactLabel, 50) || "原预约入口",
      detail: "",
      url: legacyUrl,
      note: "由旧版预约链接自动保留，可在后台确认后删除或关闭。",
      qrImage: "",
      badge: "",
      group: "booking",
      enabled: true,
    });
  }
  return channels;
}

function cleanPolicies(value: unknown): PolicySettings {
  const item = (value && typeof value === "object" ? value : {}) as Partial<PolicySettings>;
  const age = typeof item.minimumAge === "number" ? item.minimumAge : Number(item.minimumAge);
  return {
    version: text(item.version, 30) || defaultPolicies.version,
    effectiveDate: text(item.effectiveDate, 10) || defaultPolicies.effectiveDate,
    minimumAge: Number.isFinite(age) ? Math.min(100, Math.max(18, Math.round(age))) : defaultPolicies.minimumAge,
    consentIntro: text(item.consentIntro, 900) || defaultPolicies.consentIntro,
    service: text(item.service, 14000) || defaultPolicies.service,
    risk: text(item.risk, 12000) || defaultPolicies.risk,
    privacy: text(item.privacy, 16000) || defaultPolicies.privacy,
    refund: text(item.refund, 14000) || defaultPolicies.refund,
  };
}

function cleanRichBlock(value: unknown, index: number): RichContentBlock {
  const item = (value && typeof value === "object" ? value : {}) as Partial<RichContentBlock>;
  const pages: RichContentBlock["page"][] = ["home", "dream", "reality", "ideas", "booking", "notes", "policies"];
  const kinds: RichContentBlock["kind"][] = ["richText", "heading", "notice", "button", "image", "columns", "faq", "divider"];
  const page = pages.includes(item.page as RichContentBlock["page"]) ? item.page as RichContentBlock["page"] : "home";
  const kind = kinds.includes(item.kind as RichContentBlock["kind"]) ? item.kind as RichContentBlock["kind"] : "richText";
  const rawItems = Array.isArray(item.items) ? item.items : [];
  return {
    id: text(item.id, 64) || `block-${index}`,
    page,
    slot: item.slot === "beforeFooter" ? "beforeFooter" : "afterHero",
    name: text(item.name, 80) || `内容模块 ${index + 1}`,
    kind,
    mode: item.mode === "html" ? "html" : "markdown",
    content: typeof item.content === "string" ? item.content.slice(0, 30000) : "",
    secondary: typeof item.secondary === "string" ? item.secondary.slice(0, 16000) : "",
    label: text(item.label, 180),
    url: blockUrl(item.url),
    items: rawItems.slice(0, 20).map((row, rowIndex) => {
      const source = row && typeof row === "object" ? row as { id?: unknown; title?: unknown; body?: unknown } : {};
      return { id: text(source.id, 64) || `item-${index}-${rowIndex}`, title: text(source.title, 240), body: typeof source.body === "string" ? source.body.slice(0, 6000) : "" };
    }),
    visible: item.visible !== false,
  };
}

function cleanPageText(value: unknown): Record<string, string> {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(Object.entries(defaultPageText).map(([key, fallback]) => {
    const raw = source[key];
    return [key, typeof raw === "string" ? raw.slice(0, 4000) : fallback];
  }));
}

function cleanPageTextStyles(value: unknown): Record<string, PageTextStyle> {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const allowed = new Set(Object.keys(defaultPageText));
  return Object.fromEntries(Object.entries(source).filter(([key, raw]) => allowed.has(key) && raw && typeof raw === "object").map(([key, raw]) => {
    const style = raw as PageTextStyle;
    const cleaned: PageTextStyle = {};
    if (style.hidden === true) cleaned.hidden = true;
    if (isFontChoice(style.font)) cleaned.font = style.font;
    if (style.sizeScale !== undefined) cleaned.sizeScale = numberWithin(style.sizeScale, 1, 0.7, 1.6);
    if (style.letterSpacing !== undefined) cleaned.letterSpacing = numberWithin(style.letterSpacing, 0, -0.08, 0.2);
    return [key, cleaned];
  }).filter(([, style]) => Object.keys(style as PageTextStyle).length));
}

function numberWithin(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function cleanTypography(value: unknown): TypographySettings {
  const source = value && typeof value === "object" ? value as Partial<TypographySettings> : {};
  return {
    headingFont: isFontChoice(source.headingFont) ? source.headingFont : defaultTypography.headingFont,
    bodyFont: isFontChoice(source.bodyFont) ? source.bodyFont : defaultTypography.bodyFont,
    uiFont: isFontChoice(source.uiFont) ? source.uiFont : defaultTypography.uiFont,
    headingWeight: numberWithin(source.headingWeight, defaultTypography.headingWeight, 400, 800),
    headingLetterSpacing: numberWithin(source.headingLetterSpacing, defaultTypography.headingLetterSpacing, -0.06, 0.12),
    bodyWeight: numberWithin(source.bodyWeight, defaultTypography.bodyWeight, 300, 600),
    bodyScale: numberWithin(source.bodyScale, 1, 0.9, 1.2),
    letterSpacing: numberWithin(source.letterSpacing, defaultTypography.letterSpacing, 0, 0.12),
    lineHeight: numberWithin(source.lineHeight, 1.85, 1.5, 2.25),
  };
}

export function cleanContent(value: unknown): SiteContent {
  const item = (value && typeof value === "object" ? value : {}) as Partial<SiteContent>;
  return {
    contentVersion: typeof item.contentVersion === "number" ? item.contentVersion : 0,
    bookingsOpen: item.bookingsOpen !== false,
    availability: cleanAvailability(item.availability),
    priceNotice: text(item.priceNotice, 220),
    dreamPriceNotice: text(item.dreamPriceNotice, 220) || defaultContent.dreamPriceNotice,
    contactNote: text(item.contactNote, 220),
    contactLabel: text(item.contactLabel, 40) || defaultContent.contactLabel,
    contactUrl: contactUrl(item.contactUrl),
    contactChannels: Array.isArray(item.contactChannels) ? item.contactChannels.slice(0, 12).map(cleanContactChannel) : fallbackContactChannels(item),
    policies: cleanPolicies(item.policies),
    prices: Array.isArray(item.prices) ? item.prices.slice(0, 30).map(cleanPrice) : defaultContent.prices,
    promotions: Array.isArray(item.promotions) ? item.promotions.slice(0, 20).map(cleanPromotion) : defaultContent.promotions,
    knowledgeCards: Array.isArray(item.knowledgeCards) ? item.knowledgeCards.slice(0, 80).map(cleanKnowledgeCard) : defaultContent.knowledgeCards,
    cardFacts: Array.isArray(item.cardFacts) ? item.cardFacts.slice(0, 260).map(cleanCardFact).filter((fact) => fact.cardId && fact.text) : defaultContent.cardFacts,
    spreadGuides: Array.isArray(item.spreadGuides) ? item.spreadGuides.slice(0, 30).map(cleanSpreadGuide) : defaultContent.spreadGuides,
    pageText: cleanPageText(item.pageText),
    pageTextStyles: cleanPageTextStyles(item.pageTextStyles),
    richBlocks: Array.isArray(item.richBlocks) ? item.richBlocks.slice(0, 40).map(cleanRichBlock) : [],
    typography: cleanTypography(item.typography),
  };
}
