import type { PageTextStyle, TypographySettings } from "../lib/content-types";
import { fontStack } from "../lib/typography";
import PublicTextStyles from "./PublicTextStyles";

export default function PublicTypography({ settings, pageText = {}, fieldStyles = {} }: { settings: TypographySettings; pageText?: Record<string, string>; fieldStyles?: Record<string, PageTextStyle> }) {
  const bodyScale = Math.min(1.2, Math.max(0.9, settings.bodyScale));
  const letterSpacing = Math.min(0.12, Math.max(0, settings.letterSpacing));
  const lineHeight = Math.min(2.25, Math.max(1.5, settings.lineHeight));
  const headingWeight = Math.min(800, Math.max(400, settings.headingWeight));
  const headingLetterSpacing = Math.min(0.12, Math.max(-0.06, settings.headingLetterSpacing));
  const bodyWeight = Math.min(600, Math.max(300, settings.bodyWeight));
  const sizeOffset = Math.round((bodyScale - 1) * 16 * 10) / 10;
  return <><style>{`.public-page{--reader-heading-font:${fontStack(settings.headingFont)};--reader-body-font:${fontStack(settings.bodyFont)};--reader-ui-font:${fontStack(settings.uiFont)};--reader-heading-weight:${headingWeight};--reader-heading-letter-spacing:${headingLetterSpacing}em;--reader-body-weight:${bodyWeight};--reader-copy-size-offset:${sizeOffset}px;--reader-copy-letter-spacing:${letterSpacing}em;--reader-copy-line-height:${lineHeight};}`}</style><PublicTextStyles pageText={pageText} styles={fieldStyles} /></>;
}
