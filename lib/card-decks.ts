export type DrawDeckId = "rws" | "lenormand" | "marseille" | "thoth";

export type DrawCardMeta = {
  id: string;
  name: string;
  english: string;
  group: string;
  image?: string;
  number?: string;
};

const majors: Array<[string, string, string, string]> = [
  ["00", "愚人", "THE FOOL", "0"], ["01", "魔术师", "THE MAGICIAN", "I"], ["02", "女祭司", "THE HIGH PRIESTESS", "II"],
  ["03", "女皇", "THE EMPRESS", "III"], ["04", "皇帝", "THE EMPEROR", "IV"], ["05", "教皇", "THE HIEROPHANT", "V"],
  ["06", "恋人", "THE LOVERS", "VI"], ["07", "战车", "THE CHARIOT", "VII"], ["08", "力量", "STRENGTH", "VIII"],
  ["09", "隐者", "THE HERMIT", "IX"], ["10", "命运之轮", "WHEEL OF FORTUNE", "X"], ["11", "正义", "JUSTICE", "XI"],
  ["12", "倒吊人", "THE HANGED MAN", "XII"], ["13", "死神", "DEATH", "XIII"], ["14", "节制", "TEMPERANCE", "XIV"],
  ["15", "恶魔", "THE DEVIL", "XV"], ["16", "高塔", "THE TOWER", "XVI"], ["17", "星星", "THE STAR", "XVII"],
  ["18", "月亮", "THE MOON", "XVIII"], ["19", "太阳", "THE SUN", "XIX"], ["20", "审判", "JUDGEMENT", "XX"], ["21", "世界", "THE WORLD", "XXI"],
];

const minorRanks: Array<[string, string, string]> = [
  ["01", "王牌", "ACE"], ["02", "二", "TWO"], ["03", "三", "THREE"], ["04", "四", "FOUR"],
  ["05", "五", "FIVE"], ["06", "六", "SIX"], ["07", "七", "SEVEN"], ["08", "八", "EIGHT"],
  ["09", "九", "NINE"], ["10", "十", "TEN"], ["11", "侍从", "PAGE"], ["12", "骑士", "KNIGHT"],
  ["13", "王后", "QUEEN"], ["14", "国王", "KING"],
];

const suits: Array<{ code: string; zh: string; en: string; filePrefix: string }> = [
  { code: "wands", zh: "权杖", en: "WANDS", filePrefix: "Wands" },
  { code: "cups", zh: "圣杯", en: "CUPS", filePrefix: "Cups" },
  { code: "swords", zh: "宝剑", en: "SWORDS", filePrefix: "Swords" },
  { code: "pents", zh: "星币", en: "PENTACLES", filePrefix: "Pents" },
];

const majorFiles = [
  "RWS Tarot 00 Fool.jpg", "RWS Tarot 01 Magician.jpg", "RWS Tarot 02 High Priestess.jpg", "RWS Tarot 03 Empress.jpg",
  "RWS Tarot 04 Emperor.jpg", "RWS Tarot 05 Hierophant.jpg", "RWS Tarot 06 Lovers.jpg", "RWS Tarot 07 Chariot.jpg",
  "RWS Tarot 08 Strength.jpg", "RWS Tarot 09 Hermit.jpg", "RWS Tarot 10 Wheel of Fortune.jpg", "RWS Tarot 11 Justice.jpg",
  "RWS Tarot 12 Hanged Man.jpg", "RWS Tarot 13 Death.jpg", "RWS Tarot 14 Temperance.jpg", "RWS Tarot 15 Devil.jpg",
  "RWS Tarot 16 Tower.jpg", "RWS Tarot 17 Star.jpg", "RWS Tarot 18 Moon.jpg", "RWS Tarot 19 Sun.jpg",
  "RWS Tarot 20 Judgement.jpg", "RWS Tarot 21 World.jpg",
];

export const rwsCards: DrawCardMeta[] = [
  ...majors.map(([number, name, english, roman], index) => ({
    id: `rws-major-${number}`,
    name,
    english,
    group: "大阿卡纳",
    number: roman,
    image: `/tarot/rws/${majorFiles[index].replaceAll(" ", "_")}`,
  })),
  ...suits.flatMap((suit) => minorRanks.map(([number, rankZh, rankEn]) => ({
    id: `rws-${suit.code}-${number}`,
    name: `${suit.zh}${rankZh}`,
    english: `${rankEn} OF ${suit.en}`,
    group: suit.zh,
    image: `/tarot/rws/${suit.filePrefix}${number}.jpg`,
  }))),
];

const lenormandNames: Array<[string, string]> = [
  ["骑士", "RIDER"], ["四叶草", "CLOVER"], ["船", "SHIP"], ["房屋", "HOUSE"], ["树", "TREE"], ["云", "CLOUDS"],
  ["蛇", "SNAKE"], ["棺材", "COFFIN"], ["花束", "BOUQUET"], ["镰刀", "SCYTHE"], ["鞭子", "WHIP"], ["鸟", "BIRDS"],
  ["孩子", "CHILD"], ["狐狸", "FOX"], ["熊", "BEAR"], ["星星", "STARS"], ["鹳", "STORK"], ["狗", "DOG"],
  ["塔", "TOWER"], ["花园", "GARDEN"], ["山", "MOUNTAIN"], ["十字路口", "CROSSROADS"], ["老鼠", "MICE"], ["心", "HEART"],
  ["戒指", "RING"], ["书", "BOOK"], ["信", "LETTER"], ["男人", "MAN"], ["女人", "WOMAN"], ["百合", "LILIES"],
  ["太阳", "SUN"], ["月亮", "MOON"], ["钥匙", "KEY"], ["鱼", "FISH"], ["锚", "ANCHOR"], ["十字架", "CROSS"],
];

export const lenormandCards: DrawCardMeta[] = lenormandNames.map(([name, english], index) => ({
  id: `lenormand-${index + 1}`,
  name,
  english,
  group: "雷诺曼",
  number: String(index + 1).padStart(2, "0"),
  image: `/tarot/lenormand/dondorf-v104/${String(index + 1).padStart(2, "0")}.jpg`,
}));

export const drawDeckOptions: Array<{
  id: DrawDeckId;
  label: string;
  subtitle: string;
  count: number;
  available: boolean;
}> = [
  { id: "rws", label: "韦特–史密斯", subtitle: "Waite–Smith · 1910", count: 78, available: true },
  { id: "lenormand", label: "雷诺曼", subtitle: "B. Dondorf · 19th c.", count: 36, available: true },
  { id: "marseille", label: "马赛", subtitle: "历史公版整理中", count: 78, available: false },
  { id: "thoth", label: "托特", subtitle: "画面授权暂不启用", count: 78, available: false },
];
