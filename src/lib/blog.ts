export type BlogCategory =
  | 'Communication'
  | 'Emotional Connection'
  | 'Wellness'
  | 'Dating'
  | 'Relationships'
  | 'Self-Love';

export interface ChatGameQuestion {
  keywords: string[];
  answer: string;
}

export interface ChatGameData {
  welcomeMessage: string;
  maxQuestions: number;
  articlePrompt: string;
  questions: ChatGameQuestion[];
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  content: string[];
  image: string;
  imageWebP?: string;
  author: string;
  date: string;
  readingTime: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  seoUrl: string;
  relatedSlugs: string[];

  enableChatGame?: boolean;
  chatGameData?: ChatGameData;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Communication',
  'Emotional Connection',
  'Wellness',
  'Dating',
  'Relationships',
  'Self-Love',
];
