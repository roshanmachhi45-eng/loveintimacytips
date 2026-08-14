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
    title: 'Practice Active Listening',
    text: 'When your partner talks, give them your full attention. Put away distractions, make eye contact, and listen to understand rather than to reply.',
  },
  {
    title: 'Show Appreciation Daily',
    text: 'Small words like "thank you" or simple compliments can make a big difference. Feeling valued strengthens trust and keeps the relationship positive.',
  },
  {
    title: "Respect Each Other's Boundaries",
    text: 'Every person has different comfort levels and preferences. Respecting those boundaries creates a foundation of trust and mutual care.',
  },
  {
    title: 'Build Emotional Connection',
    text: 'Listening with empathy, offering support, and being present during important moments deepen emotional attachment and strengthen your bond.',
  },
  {
    title: 'Resolve Conflicts Calmly',
    text: 'Disagreements are natural. Focus on the problem, not the person. Use calm language and work together to find solutions that respect both perspectives.',
  },
  {
    title: 'Learn Each Other\u2019s Love Language',
    text: 'People express and receive love differently — through words, actions, gifts, time, or touch. Discovering your partner\u2019s love language helps you connect more deeply.',
  },
  {
    title: 'Plan Date Nights Regularly',
    text: 'Set aside dedicated time for each other without distractions. Whether it\u2019s a dinner out or a movie at home, consistent date nights keep the spark alive.',
  },
  {
    title: 'Support Each Other\u2019s Goals',
    text: 'Encourage your partner\u2019s dreams and celebrate their achievements. Being each other\u2019s biggest cheerleader builds a strong, supportive partnership.',
  },
  {
    title: 'Keep Learning About Each Other',
    text: 'People grow and change over time. Stay curious about your partner\u2019s dreams, interests, and feelings to keep your relationship fresh and meaningful.',
  },
  {
    title: 'Practice Self-Love',
    text: 'A healthy relationship starts with a healthy relationship with yourself. Take care of your own well-being so you can bring your best self to the partnership.',
  },
  {
    title: 'Express Gratitude Often',
    text: 'Regularly tell your partner what you appreciate about them. Gratitude shifts focus to the positive and strengthens emotional bonds over time.',
  },
  {
    title: 'Create Shared Traditions',
    text: 'Whether it\u2019s a Friday movie night or an annual trip, shared rituals give your relationship rhythm and create lasting memories together.',
  },
  {
    title: 'Be Patient and Kind',
    text: 'Healthy relationships are built through consistent acts of kindness, respect, patience, and understanding. Small efforts every day create lasting happiness.',
  },
];

export function getRandomTips(count: number): Tip[] {
  const shuffled = [...relationshipTips].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
