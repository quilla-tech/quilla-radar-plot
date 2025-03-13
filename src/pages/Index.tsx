import { useChartData } from "../hooks/useChartData";
import RadarChart from "../components/RadarChart";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { data, isLoading, error } = useChartData();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // If data is loaded but partial_percentage is less than 100, refresh after 5 seconds
    if (data && data.partial_percentage && data.partial_percentage < 100) {
      setRefreshing(true);
      const timer = setTimeout(() => {
        console.log("Refreshing data due to partial percentage:", data.partial_percentage);
        queryClient.invalidateQueries({ queryKey: ["chartData"] });
        setRefreshing(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [data, queryClient]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h1>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
          <RadarChart data={data?.data || []} />
        </div>
      )}
    </div>
  );
};

export default Index;