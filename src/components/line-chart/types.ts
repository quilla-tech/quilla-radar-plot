export interface DataPoint {
  date: string;
  sales: number;
  goal: number;
  spotify_listeners?: number;
  spotify_followers?: number;
  spotify_popularity?: number;
  facebook_likes?: number;
  facebook_talks?: number;
  instagram_followers?: number;
  youtube_channel_subscribers?: number;
  youtube_channel_views?: number;
  tiktok_followers?: number;
  tiktok_likes?: number;
}

export interface Annotation {
  date: string;
  description: string;
  type: string;
}