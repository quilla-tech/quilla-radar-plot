import { useQuery } from "@tanstack/react-query";

/**
 * Complete list of chart metrics in artist_data.json.
 */
interface ArtistDataResponse {
  radarData: {
    comparison_results: {
      sp_followers: MetricData;
      tiktok_likes: MetricData;
      ins_followers: MetricData;
      sp_popularity: MetricData;
      tiktok_followers: MetricData;
      facebook_followers: MetricData;
      tiktok_track_posts: MetricData;
      sp_monthly_listeners: MetricData;
      twitter_followers?: MetricData;
      youtube_subscribers?: MetricData;
    },
    partial_percentage: number;
  }
  artistName?: string;
  projectName?: string;
}

interface MetricData {
  max_value: number;
  min_value: number;
  artist_raw_value: number;
  artist_normalized_score: number;
  related_artists_average: number;
  related_artists_normalized_average: number;
}

interface DataPoint {
  metric: string;
  raw_value: number;
  normalized_score: number;
  max_value: number;
  min_value: number;
  related_artists_average: number;
  related_artists_normalized_average: number;
}

/**
 * The final data returned by useChartData:
 *  - data: unified timeseries array of all metrics
 *  - partial_percentage: percentage of data that has been loaded
 */
interface ChartDataResult {
  data: DataPoint[];
  partial_percentage?: number;
}

async function fetchArtistData(): Promise<ArtistDataResponse> {
    // Extract projectId and accessToken from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId') || "trNmqMoXyc8A56J0woHC";
    const accessToken = urlParams.get('accessToken') || "TOKEN";
    const apiUrl = urlParams.get('apiURL') || 'https://us-central1-get-while.cloudfunctions.net';
    
    if (!projectId || !accessToken) {
      throw new Error("Missing required URL parameters: projectId or accessToken");
    }
    
    const response = await fetch(`${apiUrl}/api/projects/benchmark/radar?projectId=${projectId}`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch artist data");
    return (await response.json()) as ArtistDataResponse;
}

export function useChartData() {
  return useQuery<ChartDataResult>({
    queryKey: ["chartData"],
    queryFn: async () => {
      const artistData = await fetchArtistData();

      console.log("Artist data: ");
      console.log(artistData.radarData.comparison_results);

      // Transform the data into an array of DataPoints
      try {
        const finalData: DataPoint[] = Object.entries(artistData.radarData.comparison_results)
          .filter(([_, values]) => values !== null)
          .map(([metric, values]) => ({
            metric,
            raw_value: values.artist_raw_value,
            normalized_score: values.artist_normalized_score,
            max_value: values.max_value,
            min_value: values.min_value,
            related_artists_average: values.related_artists_average,
            related_artists_normalized_average: values.related_artists_normalized_average
          }));

        return {
          data: finalData,
          partial_percentage: artistData.radarData.partial_percentage
        };
      } catch (error) {
        console.error("Error transforming artist data: ", error);
        throw new Error("Error transforming artist data: " + error);
      }
    },
    // Don't refetch automatically - we'll handle this in the UI
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}