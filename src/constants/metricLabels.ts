export const METRIC_LABELS: Record<string, string> = {
  // Spotify metrics
  "spotify__followers": "Spotify Followers",
  "spotify__listeners": "Spotify Listeners",

  "spotify__monthly_listeners": "Spotify Monthly Listeners",
  "spotify__popularity": "Spotify Popularity",
  
  // TikTok metrics
  "tiktok__likes": "TikTok Likes",
  "tiktok__followers": "TikTok Followers",
  "tiktok__track_posts": "Track Posts on TikTok",

  // Twitter metrics
  "twitter__followers": "Twitter Followers",
  "twitter__likes": "Twitter Likes",
  "twitter__retweets": "Twitter Retweets",
  "twitter__posts": "Twitter Posts",
  
  // Instagram metrics
  "instagram__followers": "Instagram Followers",
  
  // Facebook metrics
  "facebook__followers": "Facebook Followers",
  "facebook__likes": "Facebook Likes",

  "youtube_channel__views": "YT Views",
  "youtube_channel__subscribers": "YT Subscribers"
};

// Optional: Color mapping for consistent visualization
export const METRIC_COLORS: Record<string, string> = {
  // Spotify metrics
  "spotify__followers": "rgb(30, 215, 96)", // Spotify green
  "spotify__monthly_listeners": "rgb(25, 185, 84)",
  "spotify__popularity": "rgb(20, 155, 72)",
  "spotify__listeners": "rgb(15, 125, 60)",
  
  // TikTok metrics
  "tiktok__likes": "rgb(254, 44, 85)", // TikTok red
  "tiktok__followers": "rgb(224, 14, 55)",
  "tiktok__track_posts": "rgb(194, 0, 35)",
  
  // Instagram metrics
  "instagram__followers": "rgb(225, 48, 108)", // Instagram gradient color
  
  // Facebook metrics
  "facebook__followers": "rgb(24, 119, 242)", // Facebook blue
  "facebook__likes": "rgb(24, 119, 242)",

  // YouTube metrics
  "youtube_channel__views": "rgb(24, 119, 242)",
  "youtube_channel__ubscribers": "rgb(24, 119, 242)",
};

// Optional: Category grouping
export const METRIC_CATEGORIES = {
  spotify: ["spotify__followers", "spotify__monthly_listeners", "spotify__popularity", "spotify__listeners"],
  tiktok: ["tiktok__likes", "tiktok__followers", "tiktok__track_posts"],
  instagram: ["instagram__followers"],
  facebook: ["facebook__followers", "facebook__likes"],
  youtube: ["youtube_channel__views", "youtube_channel__subscribers"]
} as const; 