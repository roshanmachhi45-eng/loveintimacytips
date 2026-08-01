export interface Tip {
  title: string;
  text: string;
}

export const relationshipTips: Tip[] = [
  {
    title: 'Communicate Openly',
    text: 'Strong relationships begin with honest communication. Share your thoughts, feelings, and expectations openly so both partners feel understood and respected.',
  },
  {
    title: 'Spend Quality Time Together',
    text: 'Even a few uninterrupted minutes each day can strengthen your connection. Meaningful conversations and shared activities help build emotional closeness.',
  },
  {
    title: 'Take Things Slowly',
    text: 'Healthy intimacy grows naturally when there is no pressure or rush. Moving at a comfortable pace helps both partners feel relaxed, safe, and connected.',
  },
  {
    title: 'Show Appreciation',
    text: 'Small words like "thank you" or simple compliments can make a big difference. Feeling valued strengthens trust and keeps the relationship positive.',
  },
  {
    title: "Respect Each Other's Boundaries",
    text: 'Every person has different comfort levels and preferences. Respecting those boundaries creates a foundation of trust and mutual care.',
  },
  {
    title: 'Build Emotional Connection',
    text: 'Listening with empathy, offering support, and being present during important moments deepen emotional attachment. A strong emotional bond leads to a healthier relationship.',
  },
  {
    title: 'Practice Kind Physical Affection',
    text: 'Simple gestures like holding hands, hugging, or a warm smile can help partners feel loved and secure. Affection doesn\'t always need words to express care.',
  },
  {
    title: 'Manage Stress Together',
    text: 'Daily stress can affect relationships. Supporting each other through challenges, relaxing together, and maintaining a healthy lifestyle improves well-being.',
  },
  {
    title: 'Keep Learning About Each Other',
    text: "People grow and change over time. Stay curious about your partner's dreams, interests, and feelings to keep your relationship fresh and meaningful.",
  },
  {
    title: 'Make Love a Daily Habit',
    text: 'Healthy relationships are built through consistent acts of kindness, respect, patience, and understanding. Small efforts every day create lasting happiness.',
  },
];

export function getRandomTips(count: number): Tip[] {
  const shuffled = [...relationshipTips].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
