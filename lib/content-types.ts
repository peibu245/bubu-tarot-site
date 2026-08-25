export type PriceSection = "梦占" | "传讯" | "现实问题咨询" | "奇思妙想";
export type ServiceStatus = "available" | "waitlist" | "paused";

export type PriceItem = {
  id: string;
  section: PriceSection;
  title: string;
  description: string;
  price: string;
  unit: string;
  badge: string;
  delivery: string;
  turnaround: string;
  followUp: string;
  suitableFor: string;
  status: ServiceStatus;
  visible: boolean;
  featured: boolean;
};

export type Promotion = {
  id: string;
  scope: "全站" | "梦向解读" | "现实问题咨询" | "奇思妙想";
  title: string;
  description: string;
  badge: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  desktopBadgeSize?: number;
  desktopTitleSize?: number;
  desktopDescriptionSize?: number;
};

export type KnowledgeCard = {
  id: string;
  title: string;
  body: string;
  tag: string;
  visible: boolean;
};

export type CardFact = {
  id: string;
  deck: "rws" | "lenormand";
  cardId: string;
  text: string;
  visible: boolean;
};

export type SpreadSystem = "tarot" | "lenormand";

export type SpreadLayout = "line3" | "timeline3" | "choice5" | "relationship5" | "inner5" | "celtic10" | "line5" | "grid9" | "grandtableau36";

export type SpreadGuide = {
  id: string;
  system: SpreadSystem;
  title: string;
  subtitle: string;
  summary: string;
  bestFor: string;
  avoidFor: string;
  positions: string[];
  relation: string;
  layout: SpreadLayout;
  visible: boolean;
};

export type FontChoice = "clean-sans" | "soft-sans" | "book-serif" | "rounded";

export type TypographySettings = {
  headingFont: FontChoice;
  bodyFont: FontChoice;
  uiFont: FontChoice;
  headingWeight: number;
  headingLetterSpacing: number;
  bodyWeight: number;
  bodyScale: number;
  letterSpacing: number;
  lineHeight: number;
};

export type PageTextStyle = {
  hidden?: boolean;
  font?: FontChoice;
  sizeScale?: number;
  letterSpacing?: number;
};

export type AvailabilityStatus = "available" | "limited" | "full" | "rest";

export type AvailabilityDay = {
  id: string;
  weekday: string;
  date: string;
  status: AvailabilityStatus;
  note: string;
};

export type AvailabilityRule = {
  weekday: number;
  status: AvailabilityStatus;
  note: string;
};

export type AvailabilityOverride = {
  date: string;
  status: AvailabilityStatus;
  note: string;
};

export type AvailabilitySettings = {
  visible: boolean;
  title: string;
  responseText: string;
  rushText: string;
  advanceDays: number;
  weekly: AvailabilityRule[];
  overrides: AvailabilityOverride[];
  /** Kept only so older saved files can be read during migration. */
  days?: AvailabilityDay[];
};

export type ContactChannelKind = "wechat" | "xianyu" | "qq" | "xiaohongshu" | "douyin" | "link";

export type ContactChannel = {
  id: string;
  kind: ContactChannelKind;
  label: string;
  detail: string;
  url: string;
  note: string;
  qrImage: string;
  badge: string;
  group: "booking" | "social";
  enabled: boolean;
};

export type PolicySettings = {
  version: string;
  effectiveDate: string;
  minimumAge: number;
  consentIntro: string;
  service: string;
  risk: string;
  privacy: string;
  refund: string;
};


export type RichContentItem = {
  id: string;
  title: string;
  body: string;
};

export type RichBlockKind = "richText" | "heading" | "notice" | "button" | "image" | "columns" | "faq" | "divider";

export type RichContentBlock = {
  id: string;
  page: "home" | "dream" | "reality" | "ideas" | "booking" | "notes" | "policies";
  slot: "afterHero" | "beforeFooter";
  name: string;
  kind: RichBlockKind;
  mode: "markdown" | "html";
  /** Primary body / heading / caption, depending on kind. */
  content: string;
  /** Secondary body used by heading / columns. */
  secondary: string;
  /** Short label, eyebrow, button text, or image alt text. */
  label: string;
  /** Link or image URL for button / image modules. */
  url: string;
  /** Repeating rows, currently used by FAQ modules. */
  items: RichContentItem[];
  visible: boolean;
};

export type SiteContent = {
  contentVersion: number;
  bookingsOpen: boolean;
  availability: AvailabilitySettings;
  priceNotice: string;
  dreamPriceNotice: string;
  contactNote: string;
  /** Legacy single-link fields kept for old saved content. New pages use contactChannels. */
  contactLabel: string;
  contactUrl: string;
  contactChannels: ContactChannel[];
  policies: PolicySettings;
  prices: PriceItem[];
  promotions: Promotion[];
  knowledgeCards: KnowledgeCard[];
  cardFacts: CardFact[];
  spreadGuides: SpreadGuide[];
  pageText: Record<string, string>;
  pageTextStyles: Record<string, PageTextStyle>;
  richBlocks: RichContentBlock[];
  typography: TypographySettings;
};
