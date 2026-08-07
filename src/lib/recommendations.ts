import { getRandomTips, type Tip } from './tips';

export interface Activity {
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
  activities: Activity[];
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

const activitiesByBodyType: Record<string, Activity[]> = {
  'Male-slim': [
    { name: 'Morning Walk Together', description: 'Start your day with a peaceful 20-minute walk around your neighborhood or a nearby park.', benefits: 'Encourages open conversation, reduces stress, builds daily connection', difficulty: 'Beginner', emoji: '🚶' },
    { name: 'Cook a New Recipe', description: 'Pick a recipe neither of you has tried and cook it together as a team in the kitchen.', benefits: 'Teamwork, shared accomplishment, fun memories', difficulty: 'Beginner', emoji: '🍳' },
    { name: 'Stargazing Night', description: 'Lay out a blanket in your backyard or a quiet spot and watch the stars together.', benefits: 'Deep conversations, romantic atmosphere, mindfulness', difficulty: 'Beginner', emoji: '✨' },
  ],
  'Male-fit': [
    { name: 'Hiking Adventure', description: 'Explore a local trail together. Pick a route that matches your fitness level and enjoy nature.', benefits: 'Shared achievement, endorphin boost, quality time outdoors', difficulty: 'Intermediate', emoji: '🥾' },
    { name: 'Dance Class Together', description: 'Sign up for a beginner dance class — salsa, swing, or ballroom — and learn something new as a couple.', benefits: 'Physical coordination, laughter, building trust through movement', difficulty: 'Intermediate', emoji: '💃' },
    { name: 'Bike Ride Date', description: 'Rent or use your bikes and explore a scenic route together, stopping for coffee or a picnic.', benefits: 'Exercise, shared adventure, quality time', difficulty: 'Beginner', emoji: '🚲' },
  ],
  'Male-muscular': [
    { name: 'Rock Climbing Day', description: 'Visit an indoor climbing gym and belay each other through beginner-friendly routes.', benefits: 'Building trust, teamwork, shared physical challenge', difficulty: 'Advanced', emoji: '🧗' },
    { name: 'Garden Together', description: 'Plant a small garden or tend to a balcony garden. Watch your plants — and your bond — grow over weeks.', benefits: 'Shared responsibility, patience, nurturing together', difficulty: 'Beginner', emoji: '🌱' },
    { name: 'Charity Volunteer Date', description: 'Spend a few hours volunteering together at a local food bank, animal shelter, or community event.', benefits: 'Shared values, deeper connection, making a difference together', difficulty: 'Intermediate', emoji: '🤝' },
  ],
  'Female-slim': [
    { name: 'Coffee Shop Date', description: 'Visit a new coffee shop each week. Try each other\u2019s favorite drinks and discuss what you love about them.', benefits: 'Low-pressure quality time, discovery, gentle conversations', difficulty: 'Beginner', emoji: '☕' },
    { name: 'Art Gallery Visit', description: 'Explore a local art gallery or museum and share your thoughts about each piece you see.', benefits: 'Intellectual stimulation, sharing perspectives, cultural bonding', difficulty: 'Beginner', emoji: '🎨' },
    { name: 'Write Love Letters', description: 'Sit together and write handwritten letters to each other. Exchange and read them aloud.', benefits: 'Vulnerability, emotional expression, keepsake memory', difficulty: 'Intermediate', emoji: '💌' },
  ],
  'Female-fit': [
    { name: 'Yoga Together', description: 'Roll out two mats and follow a couples\u2019 yoga video. Focus on partner poses that require trust and balance.', benefits: 'Mindfulness, physical trust, stress relief', difficulty: 'Intermediate', emoji: '🧘' },
    { name: 'Running Buddy Date', description: 'Set a shared running goal — a 5K, a fun run, or a morning jog — and train together.', benefits: 'Shared goals, motivation, celebrating milestones', difficulty: 'Intermediate', emoji: '🏃' },
    { name: 'Picnic in the Park', description: 'Pack your favorite snacks and a blanket. Find a quiet spot in the park for an afternoon together.', benefits: 'Relaxed quality time, conversation, simple romance', difficulty: 'Beginner', emoji: '🧺' },
  ],
  'Female-curvy': [
    { name: 'Board Game Night', description: 'Pick a cooperative board game and work as a team to win. Laugh and strategize together.', benefits: 'Playful fun, teamwork, low-stress bonding', difficulty: 'Beginner', emoji: '🎲' },
    { name: 'Photo Album Session', description: 'Go through old photos together and share the stories behind your favorite memories.', benefits: 'Nostalgia, storytelling, deeper emotional understanding', difficulty: 'Beginner', emoji: '📸' },
    { name: 'Sunset Dinner Date', description: 'Plan a simple outdoor dinner timed with sunset. Even a homemade meal feels special outdoors.', benefits: 'Romantic atmosphere, mindful presence, quality conversation', difficulty: 'Intermediate', emoji: '🌅' },
  ],
};

const imagePool: ResultImage[] = [
  { url: '/images/recommendations/communication.webp', caption: 'Open Communication' },
  { url: '/images/recommendations/quality-time.webp', caption: 'Quality Time' },
  { url: '/images/recommendations/shared-moments.webp', caption: 'Shared Moments' },
  { url: '/images/recommendations/trust.webp', caption: 'Building Trust' },
  { url: '/images/recommendations/deep-bond.webp', caption: 'Deep Bond' },
  { url: '/images/recommendations/emotional-connection.webp', caption: 'Emotional Connection' },
  { url: '/images/recommendations/affection.webp', caption: 'Affection & Care' },
  { url: '/images/recommendations/lasting-love.webp', caption: 'Lasting Love' },
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
  return `Your compatibility score is ${score} — an ${tier} match! Your unique personalities and connection create a wonderful foundation for a thriving relationship.`;
}

function getRandomImages(count: number): ResultImage[] {
  const shuffled = [...imagePool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateRecommendations(data: InputData): RecommendationResult {
  const score = calculateScore(data);

  const key1 = `${data.p1Gender}-${data.p1Avatar}`;
  const key2 = `${data.p2Gender}-${data.p2Avatar}`;
  const activities1 = activitiesByBodyType[key1] || [];
  const activities2 = activitiesByBodyType[key2] || [];

  const seen = new Set<string>();
  const activities: Activity[] = [];
  [...activities1, ...activities2].forEach((a) => {
    if (!seen.has(a.name) && activities.length < 3) {
      seen.add(a.name);
      activities.push(a);
    }
  });
  if (activities.length < 3) {
    Object.values(activitiesByBodyType).flat().forEach((a) => {
      if (!seen.has(a.name) && activities.length < 3) {
        seen.add(a.name);
        activities.push(a);
      }
    });
  }

  return {
    score,
    summary: getSummary(score),
    tips: getRandomTips(3),
    activities,
    images: getRandomImages(3),
  };
}
