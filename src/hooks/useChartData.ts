import { useQuery } from "@tanstack/react-query";

/**
 * Complete list of chart metrics in artist_data.json.
 */
interface ArtistDataResponse {
  comparison_results: {
    sp_followers: MetricData;
    tiktok_likes: MetricData;
    ins_followers: MetricData;
    sp_popularity: MetricData;
    tiktok_followers: MetricData;
    facebook_followers: MetricData;
    tiktok_track_posts: MetricData;
    sp_monthly_listeners: MetricData;
  },
  partial_percentage: number;
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
 *  - annotations: array of annotation objects
 */
interface ChartDataResult {
  data: DataPoint[];
}

async function fetchArtistData(): Promise<ArtistDataResponse> {

    // Extract projectId and accessToken from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId') || "JKI6MbzT1D3s1nN1pbXt"
    const accessToken = urlParams.get('accessToken') || "TOKEN";
    const apiUrl = urlParams.get('apiURL') || 'http://localhost:5000/quilla-staging/us-central1';
    
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


  // const response = await fetch("https://api.npoint.io/023b6b99f04309807a1a");
  // if (!response.ok) throw new Error("Failed to fetch artist data");
  // return (await response.json()) as ArtistDataResponse;
}

// Add a new function to handle polling until complete data is available
async function fetchCompleteArtistData(): Promise<ArtistDataResponse> {
  const pollData = async (retryCount = 0, maxRetries = 12): Promise<ArtistDataResponse> => {
    const data = await fetchArtistData();
    
    // If data is complete or we've reached max retries, return the data
    if (data.partial_percentage >= 100 || retryCount >= maxRetries) {
      return data;
    }
    
    // Wait 5 seconds before trying again
    console.log(`Data is partial (${data.partial_percentage}%). Retrying in 5 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Recursive call with incremented retry count
    return pollData(retryCount + 1, maxRetries);
  };
  
  return pollData();
}

export function useChartData() {
  return useQuery<ChartDataResult>({
    queryKey: ["chartData"],
    queryFn: async () => {
      const artistData = await fetchCompleteArtistData();

      console.log("Artist data: ");
      console.log(artistData.comparison_results);

      // Transform the data into an array of DataPoints
      try {
        const finalData: DataPoint[] = Object.entries(artistData.comparison_results)
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
          data: finalData
        };
      } catch (error) {
        console.error("Error transforming artist data: ", error);
        throw new Error("Error transforming artist data: " + error);
      }

    },
  });
}