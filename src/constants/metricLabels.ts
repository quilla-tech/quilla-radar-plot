export const METRIC_LABELS: Record<string, string> = {
  // Spotify metrics
  "sp_followers": "Spotify Followers",
  "sp_monthly_listeners": "Spotify Monthly Listeners",
  "sp_popularity": "Spotify Popularity",
  
  // TikTok metrics
  "tiktok_likes": "TikTok Likes",
  "tiktok_followers": "TikTok Followers",
  "tiktok_track_posts": "Track Posts on TikTok",
  
  // Instagram metrics
  "ins_followers": "Instagram Followers",
  
  // Facebook metrics
  "facebook_followers": "Facebook Followers",
};

// Optional: Color mapping for consistent visualization
export const METRIC_COLORS: Record<string, string> = {
  // Spotify metrics
  "sp_followers": "rgb(30, 215, 96)", // Spotify green
  "sp_monthly_listeners": "rgb(25, 185, 84)",
  "sp_popularity": "rgb(20, 155, 72)",
  
  // TikTok metrics
  "tiktok_likes": "rgb(254, 44, 85)", // TikTok red
  "tiktok_followers": "rgb(224, 14, 55)",
  "tiktok_track_posts": "rgb(194, 0, 35)",
  
  // Instagram metrics
  "ins_followers": "rgb(225, 48, 108)", // Instagram gradient color
  
  // Facebook metrics
  "facebook_followers": "rgb(24, 119, 242)", // Facebook blue
};

// Optional: Category grouping
export const METRIC_CATEGORIES = {
  spotify: ["sp_followers", "sp_monthly_listeners", "sp_popularity"],
  tiktok: ["tiktok_likes", "tiktok_followers", "tiktok_track_posts"],
  instagram: ["ins_followers"],
  facebook: ["facebook_followers"]
} as const; 