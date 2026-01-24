import { FunctionalComponent } from "preact";
import { memo } from "preact/compat";
import type { ChartOptions, ChartData } from "chart.js";
import { useEffect, useState } from "preact/hooks";

// Lazily import Chart.js and react-chartjs-2 on demand
const useLazyChart = () => {
  const [charts, setCharts] = useState<{
    Line: ((props: any) => any) | null;
    Bar: ((props: any) => any) | null;
  }>({ Line: null, Bar: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [
        {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          BarElement,
          Title,
          Tooltip,
          Legend,
          Filler,
        },
        ReactChart,
      ] = await Promise.all([import("chart.js"), import("react-chartjs-2")]);

      if (typeof window !== "undefined") {
        ChartJS.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          BarElement,
          Title,
          Tooltip,
          Legend,
          Filler
        );
      }

      if (mounted) {
        setCharts({
          Line: ReactChart.Line as any,
          Bar: ReactChart.Bar as any,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return charts;
};

interface Props {
  data: ChartData<"line"> | ChartData<"bar">;
  options: ChartOptions<"line"> | ChartOptions<"bar">;
  className?: string;
  type?: "line" | "bar";
}

const TransactionSummaryChart: FunctionalComponent<Props> = ({
  data,
  options,
  className,
  type = "line",
}) => {
  const { Line, Bar } = useLazyChart();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [data]);

  if (hasError) {
    return (
      <div
        className={`${className || "h-64"} flex items-center justify-center`}
      >
        <div className="text-center text-gray-500">
          <p className="text-sm">Unable to load chart</p>
          <button
            onClick={() => setHasError(false)}
            className="text-xs text-green-600 hover:text-green-700 mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!Line || !Bar) {
    return (
      <div
        className={`${className || "h-64"} flex items-center justify-center`}
      >
        <div className="animate-pulse flex items-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          <span className="text-sm">Loading chart...</span>
        </div>
      </div>
    );
  }

  try {
    if (type === "bar") {
      return <Bar data={data} options={options} className={className} />;
    }
    return <Line data={data} options={options} className={className} />;
  } catch (error) {
    setHasError(true);
    return null;
  }
};

export default memo(TransactionSummaryChart);
