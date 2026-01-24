import { h } from "preact";
import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import { memo } from "preact/compat";

// Register chart.js components once at module level
Chart.register(...registerables);

interface Props {
  chartValue: number[];
  ChartName: string[];
}

const LineChartOne = memo(({ chartValue, ChartName }: Props) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"line", number[], string> | null>(null);

  useEffect(() => {
    // Destroy previous chart instance if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current.getContext("2d")!, {
        type: "line",
        data: {
          labels: ChartName,
          datasets: [
            {
              label: "Payment",
              backgroundColor: "rgba(75,192,192,0.2)",
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 2,
              data: chartValue,
              fill: true,
            },
          ],
        },
        options: {
          plugins: {
            title: { display: false },
            legend: {
              display: false,
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                boxHeight: 6,
                padding: 20,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
                color: "rgba(0, 0, 0, 0.1)",
                borderDash: [10, 10],
              } as any,
              ticks: {
                callback: (value: any) => {
                  if (value >= 1000000) return value / 1000000 + "M";
                  return value;
                },
              },
            },
          },
        } as any,
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartValue, ChartName]);

  return <canvas ref={chartRef} />;
});

export default LineChartOne;
