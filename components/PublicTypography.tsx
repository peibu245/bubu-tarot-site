import type { TypographySettings } from "../lib/content-types";

export default function PublicTypography({ settings }: { settings: TypographySettings }) {
  const bodyScale = Math.min(1.2, Math.max(0.9, settings.bodyScale));
  const letterSpacing = Math.min(0.12, Math.max(0, settings.letterSpacing));
  const lineHeight = Math.min(2.25, Math.max(1.5, settings.lineHeight));
  const sizeOffset = Math.round((bodyScale - 1) * 16 * 10) / 10;
  return <style>{`.public-page{--reader-copy-size-offset:${sizeOffset}px;--reader-copy-letter-spacing:${letterSpacing}em;--reader-copy-line-height:${lineHeight};}`}</style>;
}
