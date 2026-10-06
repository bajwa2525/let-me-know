// Type-only module for news articles — data now comes from the database via
// lib/backend-data.ts.

export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  imageAlt: string;
  category: string;
  date: string; // ISO yyyy-mm-dd
  author: string;
};
