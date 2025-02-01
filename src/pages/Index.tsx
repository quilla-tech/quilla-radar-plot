import { useChartData } from "../hooks/useChartData";
import RadarChart from "../components/RadarChart";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data, isLoading, error } = useChartData();

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