import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import TipsTicker from "../../components/TipsTicker";
import DrawStudio from "../../components/DrawStudio";
import SpreadLab from "../../components/SpreadLab";
import Guestbook from "../../components/Guestbook";
import CustomContentZone from "../../components/CustomContentZone";
import PublicTypography from "../../components/PublicTypography";
import { getSiteContent } from "../../lib/site-content";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const content = await getSiteContent();
  const copy = content.pageText;
  const t = (key: string) => copy[key];
  return (
    <main className="public-page notes-page">
      <PublicTypography settings={content.typography} />
      <SiteHeader copy={copy} />
      <section className="notes-hero"><p className="micro-label">{t("notesEyebrow")}</p><h1>{t("notesTitle")}</h1><p>{t("notesLead")}</p></section>
      <CustomContentZone blocks={content.richBlocks} page="notes" slot="afterHero" />
      <TipsTicker cards={content.knowledgeCards} copy={copy} />
      <DrawStudio facts={content.cardFacts} copy={copy} />
      <SpreadLab guides={content.spreadGuides} copy={copy} />
      <Guestbook copy={copy} />
      <CustomContentZone blocks={content.richBlocks} page="notes" slot="beforeFooter" />
      <SiteFooter copy={copy} />
    </main>
  );
}
