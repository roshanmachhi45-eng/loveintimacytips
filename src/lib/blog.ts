export type BlogCategory =
  | 'Communication'
  | 'Emotional Connection'
  | 'Wellness'
  | 'Dating'
  | 'Relationships'
  | 'Self-Love';

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
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Communication',
  'Emotional Connection',
  'Wellness',
  'Dating',
  'Relationships',
  'Self-Love',
];
