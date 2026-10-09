
import type { MagicEyeConfig } from './types';

export interface CosmicDailyResult {
  planetName: string;
  gemstoneName: string;
  background: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  loveMessage: string;
}

const COSMIC_RESULTS = [
  {
    planetName: 'Venus',
    gemstoneName: 'Opal',
    background: '#260b3f',
    primaryColor: '#ff69c9',
    secondaryColor: '#c084fc',
    glowColor: '#ff4fd8',
    message: 'Your heart shines with romance, tenderness and beautiful possibilities.',
  },
  {
    planetName: 'Moon',
    gemstoneName: 'Moonstone',
    background: '#101d43',
    primaryColor: '#a5d8ff',
    secondaryColor: '#c4b5fd',
    glowColor: '#8ab4ff',
    message: 'Trust the quiet feelings that bring two hearts closer together.',
  },
  {
    planetName: 'Mars',
    gemstoneName: 'Ruby',
    background: '#3b102d',
    primaryColor: '#ff5577',
    secondaryColor: '#ff9a8b',
    glowColor: '#ff3158',
    message: 'Your cosmic spark celebrates courage, passion and meaningful connection.',
  },
  {
    planetName: 'Jupiter',
    gemstoneName: 'Citrine',
    background: '#38200b',
    primaryColor: '#ffd166',
    secondaryColor: '#ff9f43',
    glowColor: '#ffbf47',
    message: 'Let optimism and kindness make room for love to grow.',
  },
  {
    planetName: 'Saturn',
    gemstoneName: 'Amethyst',
    background: '#20143f',
    primaryColor: '#c4a7ff',
    secondaryColor: '#8b7bff',
    glowColor: '#a78bfa',
    message: 'Patient hearts can build a bond filled with trust and loyalty.',
  },
  {
    planetName: 'Mercury',
    gemstoneName: 'Emerald',
    background: '#082e2b',
    primaryColor: '#62e6b5',
    secondaryColor: '#67d4e8',
    glowColor: '#35e0b1',
    message: 'Honest words and curious hearts can create a special connection.',
  },
  {
    planetName: 'Sun',
    gemstoneName: 'Sunstone',
    background: '#421b12',
    primaryColor: '#ffb45e',
    secondaryColor: '#ff6f61',
    glowColor: '#ff9b54',
    message: 'Your warmth can turn ordinary moments into treasured memories.',
  },
  {
    planetName: 'Venus',
    gemstoneName: 'Rose Quartz',
    background: '#40142f',
    primaryColor: '#ffa6d5',
    secondaryColor: '#e7a7ff',
    glowColor: '#ff7fc8',
    message: 'Make space for gentle affection and the beauty of closeness.',
  },
  {
    planetName: 'Moon',
    gemstoneName: 'Pearl',
    background: '#172b48',
    primaryColor: '#e0e7ff',
    secondaryColor: '#91c8ff',
    glowColor: '#b9d8ff',
    message: 'A caring heart finds magic in comfort, trust and understanding.',
  },
  {
    planetName: 'Mars',
    gemstoneName: 'Red Garnet',
    background: '#390e24',
    primaryColor: '#ff668a',
    secondaryColor: '#d94675',
    glowColor: '#ff386f',
    message: 'Be brave enough to express the feelings that matter most.',
  },
  {
    planetName: 'Jupiter',
    gemstoneName: 'Yellow Sapphire',
    background: '#211b43',
    primaryColor: '#ffe08a',
    secondaryColor: '#a9a4ff',
    glowColor: '#ffd166',
    message: 'Hope and generosity can help a meaningful bond flourish.',
  },
  {
    planetName: 'Saturn',
    gemstoneName: 'Blue Sapphire',
    background: '#111b42',
    primaryColor: '#82aaff',
    secondaryColor: '#b9a0ff',
    glowColor: '#648cff',
    message: 'Steady affection reminds us that trust grows one day at a time.',
  },
  {
    planetName: 'Mercury',
    gemstoneName: 'Peridot',
    background: '#123324',
    primaryColor: '#c1f27a',
    secondaryColor: '#54dfb2',
    glowColor: '#9be564',
    message: 'Fresh conversations can open the door to exciting possibilities.',
  },
  {
    planetName: 'Sun',
    gemstoneName: 'Ruby',
    background: '#431b18',
    primaryColor: '#ffc078',
    secondaryColor: '#ff758f',
    glowColor: '#ff9466',
    message: 'Celebrate the confidence, joy and warmth you bring to love.',
  },
];

function hashString(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getLocalDayNumber(date: Date): number {
  const localDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return Math.floor(localDate.getTime() / 86400000);
}

export function getCosmicDailyResult(
  config: MagicEyeConfig,
  date: Date = new Date()
): CosmicDailyResult {
  const name = config.name.trim() || 'Your Love';

  const personalKey = [
    name.toLowerCase(),
    config.gender,
    config.faceTone,
    config.faceStructure,
    config.hairStyle,
    config.beardStyle,
    config.glasses,
  ].join('|');

  const personalOffset =
    hashString(personalKey) % COSMIC_RESULTS.length;

  const dayNumber = getLocalDayNumber(date);

  const resultIndex =
    (personalOffset + dayNumber) % COSMIC_RESULTS.length;

  const result = COSMIC_RESULTS[resultIndex];

  return {
    planetName: result.planetName,
    gemstoneName: result.gemstoneName,
    background: result.background,
    primaryColor: result.primaryColor,
    secondaryColor: result.secondaryColor,
    glowColor: result.glowColor,
    loveMessage: `${name}, ${result.message}`,
  };
}
