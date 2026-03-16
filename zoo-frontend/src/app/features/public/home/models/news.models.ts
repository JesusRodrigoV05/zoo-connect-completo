export type NewsType = "new" | "promo" | "event";

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  tag: {
    label: string;
    type: NewsType;
  };
}
