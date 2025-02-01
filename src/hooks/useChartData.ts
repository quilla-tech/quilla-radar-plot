import { useQuery } from "@tanstack/react-query";

/**
 * Complete list of chart metrics in artist_data.json.
 */
interface ArtistDataResponse {
  charts: {
    spotify__followers: { date: string; value: number }[];
    spotify__listeners: { date: string; value: number }[];
    spotify__popularity: { date: string; value: number }[];
    facebook__likes: { date: string; value: number }[];
    facebook__talks: { date: string; value: number }[];
    instagram__followers: { date: string; value: number }[];
    youtube_channel__subscribers: { date: string; value: number }[];
    youtube_channel__views: { date: string; value: number }[];
    tiktok__followers: { date: string; value: number }[];
    tiktok__likes: { date: string; value: number }[];
  };
  annotations: {
    date: string;
    description: string;
    type: string;
  }[];
  project_id: string;
}

interface DataPoint {
  date: string;
  // Existing and newly added fields from artist_data.json
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

/**
 * The final data returned by useChartData:
 *  - data: unified timeseries array of all metrics
 *  - annotations: array of annotation objects
 */
interface ChartDataResult {
  data: DataPoint[];
  annotations: {
    date: string;
    description: string;
    type: string;
  }[];
}

async function fetchArtistData(): Promise<ArtistDataResponse> {
  const response = await fetch("/artist_data.json");
  if (!response.ok) throw new Error("Failed to fetch artist data");
  return (await response.json()) as ArtistDataResponse;
}

export function useChartData() {
  return useQuery<ChartDataResult>({
    queryKey: ["chartData"],
    queryFn: async () => {
      const artistData = await fetchArtistData();

      // We'll gather all possible dates from each chart array
      const allDatesSet = new Set<string>();

      // From each chart in artist data
      Object.values(artistData.charts).forEach((metricArray) => {
        metricArray.forEach((pt) => allDatesSet.add(pt.date));
      });

      // Convert Set to sorted array of dates
      const allDates = Array.from(allDatesSet).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      // Create dictionaries for quick lookup from each metric
      function arrayToMap(
        arr: { date: string; value: number }[]
      ): Record<string, number> {
        const map: Record<string, number> = {};
        arr.forEach((d) => {
          map[d.date] = d.value;
        });
        return map;
      }

      const spotifyListenersMap = arrayToMap(artistData.charts.spotify__listeners);
      const spotifyFollowersMap = arrayToMap(artistData.charts.spotify__followers);
      const spotifyPopularityMap = arrayToMap(artistData.charts.spotify__popularity);
      const facebookLikesMap = arrayToMap(artistData.charts.facebook__likes);
      const facebookTalksMap = arrayToMap(artistData.charts.facebook__talks);
      const instagramFollowersMap = arrayToMap(artistData.charts.instagram__followers);
      const youtubeSubscribersMap = arrayToMap(
        artistData.charts.youtube_channel__subscribers
      );
      const youtubeViewsMap = arrayToMap(
        artistData.charts.youtube_channel__views
      );
      const tiktokFollowersMap = arrayToMap(artistData.charts.tiktok__followers);
      const tiktokLikesMap = arrayToMap(artistData.charts.tiktok__likes);

      // Combine them into one array of DataPoint
      const finalData: DataPoint[] = allDates.map((date) => ({
        date,
        spotify_listeners: spotifyListenersMap[date] || 0,
        spotify_followers: spotifyFollowersMap[date] || 0,
        spotify_popularity: spotifyPopularityMap[date] || 0,
        facebook_likes: facebookLikesMap[date] || 0,
        facebook_talks: facebookTalksMap[date] || 0,
        instagram_followers: instagramFollowersMap[date] || 0,
        youtube_channel_subscribers: youtubeSubscribersMap[date] || 0,
        youtube_channel_views: youtubeViewsMap[date] || 0,
        tiktok_followers: tiktokFollowersMap[date] || 0,
        tiktok_likes: tiktokLikesMap[date] || 0,
      }));

      return {
        data: finalData,
        annotations: artistData.annotations || [],
      };
    },
  });
}