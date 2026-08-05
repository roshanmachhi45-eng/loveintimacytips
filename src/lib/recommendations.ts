import { getRandomTips, type Tip } from './tips';

export interface Position {
  name: string;
  description: string;
  benefits: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  emoji: string;
}

export interface ResultImage {
  url: string;
  caption: string;
}

export interface RecommendationResult {
  score: number;
  summary: string;
  tips: Tip[];
  positions: Position[];
  images: ResultImage[];
}

export interface InputData {
  p1Gender: string;
  p1Avatar: string;
  p1Age: number | null;
  p2Gender: string;
  p2Avatar: string;
  p2Age: number | null;
  experience: string;
}

const positionsByBodyType: Record<string, Position[]> = {
  'Male-slim': [
    { name: 'The Lotus', description: 'Sit facing each other with legs wrapped around. The slim partner sits cross-legged while the partner straddles.', benefits: 'Deep eye contact, intimate connection, gentle depth control', difficulty: 'Beginner', emoji: '🪷' },
    { name: 'Standing Embrace', description: 'The slim partner stands supporting partner against a wall for face-to-face closeness.', benefits: 'Full body contact, passionate, easy positioning', difficulty: 'Intermediate', emoji: '🤗' },
    { name: 'The Scissor', description: 'Both partners lie on their sides with legs interlocked in a scissoring motion.', benefits: 'Relaxed pace, hands-free, equal effort', difficulty: 'Beginner', emoji: '✂️' },
  ],
  'Male-fit': [
    { name: 'The Bridge', description: 'Partner lifts hips while the fit partner kneels between legs, supporting with core strength.', benefits: 'Deeper penetration, core engagement, great angle', difficulty: 'Intermediate', emoji: '🌉' },
    { name: 'The Eagle', description: 'Partner lies on back with legs raised wide; the fit partner stands or kneels at edge of bed.', benefits: 'Deep connection, visual intimacy, G-spot access', difficulty: 'Intermediate', emoji: '🦅' },
    { name: 'The Cowgirl', description: 'Partner rides on top while the fit partner lies back, hands free to explore.', benefits: 'Partner control, clitoral stimulation, stamina saving', difficulty: 'Beginner', emoji: '🐎' },
  ],
  'Male-muscular': [
    { name: 'The Standing Carry', description: 'The muscular partner lifts and supports partner entirely, holding against wall or in air.', benefits: 'Full body support, deep penetration, athletic thrill', difficulty: 'Advanced', emoji: '💪' },
    { name: 'The Deck Chair', description: "Partner lies back with legs on muscular partner's shoulders while he kneels.", benefits: 'Maximum depth, controlled pace, visual connection', difficulty: 'Advanced', emoji: '🪑' },
    { name: 'The Spooning Deluxe', description: 'Side-by-side with the muscular partner wrapping from behind for full-body contact.', benefits: 'Intimate, relaxed, hands-free exploration', difficulty: 'Beginner', emoji: '🥄' },
  ],
  'Female-slim': [
    { name: 'The Lotus', description: 'Both partners sit facing, legs intertwined. Slim partner wraps legs around for closeness.', benefits: 'Eye contact, intimate, gentle rhythm', difficulty: 'Beginner', emoji: '🪷' },
    { name: 'The Modified Missionary', description: 'Slim partner lies back with a pillow under hips for elevated angle and comfort.', benefits: 'Classic comfort, easy communication, deep kiss access', difficulty: 'Beginner', emoji: '💕' },
    { name: 'The Reverse Cowgirl', description: 'Slim partner rides facing away, giving control over angle and depth.', benefits: 'Visual variety, clitoral access, partner control', difficulty: 'Intermediate', emoji: '🔄' },
  ],
  'Female-fit': [
    { name: 'The Cowgirl', description: 'Fit partner rides on top using leg and core strength for controlled rhythm.', benefits: 'Partner control, clitoral stimulation, visual intimacy', difficulty: 'Beginner', emoji: '🐎' },
    { name: 'The Bridge', description: 'Fit partner lifts hips in bridge pose while partner kneels for deeper angle.', benefits: 'Active engagement, depth control, pelvic floor toning', difficulty: 'Intermediate', emoji: '🌉' },
    { name: 'The Lap Dance', description: 'Partner sits on chair/edge of bed; fit partner straddles facing them for rhythm control.', benefits: 'Intimate face-to-face, hands-free, controlled pace', difficulty: 'Intermediate', emoji: '💃' },
  ],
  'Female-curvy': [
    { name: 'The Spooning', description: 'Side-by-side from behind — comfortable, supportive, and deeply intimate for curvy bodies.', benefits: 'Comfortable, hands-free, full-body contact', difficulty: 'Beginner', emoji: '🥄' },
    { name: 'The Modified Doggy', description: 'Partner stands at bed edge while curvy partner lies on back with hips at edge.', benefits: 'Comfortable angle, deep connection, pillow support', difficulty: 'Beginner', emoji: '🐕' },
    { name: "The Queen's Throne", description: 'Curvy partner sits on top straddling partner who lies back, controlling depth and pace.', benefits: 'Partner control, comfortable, confident positioning', difficulty: 'Intermediate', emoji: '👑' },
  ],
};

const imagePool: ResultImage[] = [
  { url: 'https://images.pexels.com/photos/3019143/pexels-photo-3019143.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Emotional Connection' },
  { url: 'https://images.pexels.com/photos/3191075/pexels-photo-3191075.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Open Communication' },
  { url: 'https://images.pexels.com/photos/3759775/pexels-photo-3759775.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Quality Time Together' },
  { url: 'https://images.pexels.com/photos/3759762/pexels-photo-3759762.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Building Trust' },
  { url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Shared Moments' },
  { url: 'https://images.pexels.com/photos/1024996/pexels-photo-1024996.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Deep Bond' },
  { url: 'https://images.pexels.com/photos/14106980/pexels-photo-14106980.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Affection & Care' },
  { url: 'https://images.pexels.com/photos/1024984/pexels-photo-1024984.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Lasting Love' },
];

function calculateScore(data: InputData): number {
  let score = 70;
  if (data.p1Age && data.p2Age) {
    const diff = Math.abs(data.p1Age - data.p2Age);
    if (diff <= 5) score += 12;
    else if (diff <= 10) score += 8;
    else if (diff <= 15) score += 4;
  }
  if (data.experience === 'Experienced') score += 8;
  else if (data.experience === 'Few times') score += 5;
  else if (data.experience === 'First time') score += 3;
  if (data.p1Avatar && data.p2Avatar && data.p1Avatar !== data.p2Avatar) score += 4;
  if (data.p1Gender && data.p2Gender) score += 4;
  return Math.min(score, 98);
}

function getSummary(score: number): string {
  const tier = score >= 90 ? 'exceptional' : score >= 80 ? 'wonderful' : 'great';
  return `Your compatibility score is ${score} — an ${tier} match! Your unique body types and connection create a special dynamic for intimacy.`;
}

function getRandomImages(count: number): ResultImage[] {
  const shuffled = [...imagePool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateRecommendations(data: InputData): RecommendationResult {
  const score = calculateScore(data);

  const key1 = `${data.p1Gender}-${data.p1Avatar}`;
  const key2 = `${data.p2Gender}-${data.p2Avatar}`;
  const positions1 = positionsByBodyType[key1] || [];
  const positions2 = positionsByBodyType[key2] || [];

  const seen = new Set<string>();
  const positions: Position[] = [];
  [...positions1, ...positions2].forEach((p) => {
    if (!seen.has(p.name) && positions.length < 3) {
      seen.add(p.name);
      positions.push(p);
    }
  });
  if (positions.length < 3) {
    Object.values(positionsByBodyType).flat().forEach((p) => {
      if (!seen.has(p.name) && positions.length < 3) {
        seen.add(p.name);
        positions.push(p);
      }
    });
  }

  return {
    score,
    summary: getSummary(score),
    tips: getRandomTips(3),
    positions,
    images: getRandomImages(3),
  };
}
