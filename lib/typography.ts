import type { FontChoice, TypographySettings } from "./content-types";

export const fontOptions: Array<{ value: FontChoice; label: string; note: string }> = [
  { value: "clean-sans", label: "清爽黑体", note: "适合正文、价格和说明" },
  { value: "soft-sans", label: "柔和黑体", note: "字形稍圆，阅读压力较低" },
  { value: "book-serif", label: "书卷宋体", note: "适合标题和偏叙事内容" },
  { value: "rounded", label: "圆润字体", note: "适合轻松、亲近的表达" },
];

export const fontStacks: Record<FontChoice, string> = {
  "clean-sans": '"Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif',
  "soft-sans": '"Avenir Next","SF Pro Display","PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif',
  "book-serif": '"Songti SC","STSong","Noto Serif CJK SC","Source Han Serif SC","SimSun",serif',
  rounded: 'ui-rounded,"SF Pro Rounded","PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif',
};

export const defaultTypography: TypographySettings = {
  headingFont: "book-serif",
  bodyFont: "clean-sans",
  uiFont: "clean-sans",
  headingWeight: 600,
  headingLetterSpacing: 0,
  bodyWeight: 400,
  bodyScale: 1,
  letterSpacing: 0.025,
  lineHeight: 1.85,
};

export const typographyPresets: Array<{ id: string; name: string; note: string; settings: TypographySettings }> = [
  { id: "gentle", name: "温柔书卷", note: "宋体标题＋清爽正文，推荐", settings: { ...defaultTypography } },
  { id: "modern", name: "清爽现代", note: "标题和正文统一使用黑体", settings: { ...defaultTypography, headingFont: "clean-sans", headingWeight: 700, headingLetterSpacing: -0.02, letterSpacing: 0.02, lineHeight: 1.78 } },
  { id: "editorial", name: "安静书刊", note: "标题与正文都使用宋体", settings: { ...defaultTypography, bodyFont: "book-serif", headingLetterSpacing: 0.01, bodyScale: 1.02, letterSpacing: 0.02, lineHeight: 1.95 } },
  { id: "friendly", name: "轻松圆润", note: "更亲近，适合低压力咨询", settings: { ...defaultTypography, headingFont: "rounded", bodyFont: "rounded", uiFont: "rounded", headingWeight: 700, letterSpacing: 0.015, lineHeight: 1.8 } },
];

export function isFontChoice(value: unknown): value is FontChoice {
  return fontOptions.some((option) => option.value === value);
}

export function fontStack(value: FontChoice | undefined) {
  return fontStacks[value || defaultTypography.bodyFont];
}
