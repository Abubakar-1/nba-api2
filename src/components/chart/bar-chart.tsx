import { h } from "preact";
import { Chart, registerables, LegendItem, ChartDataset } from "chart.js";
import { useEffect, useRef } from "preact/hooks";
import { memo } from "preact/compat";

// Register chart.js components once at module level
Chart.register(...registerables);

interface Props {
  femaleVal: number;
  maleVale: number;
}

const BarChart = memo(({ femaleVal, maleVale }: Props) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"bar", number[], string> | null>(null);
  const originalBackgroundColorsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    // Destroy previous chart instance if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current.getContext("2d")!, {
        type: "bar",
        data: {
          labels: ["Gender"],
          datasets: [
            {
              label: "Male",
              backgroundColor: "rgba(0, 144, 10,1)",
              borderColor: "rgba(0, 144, 10,1)",
              borderWidth: 0,
              data: [maleVale],
              categoryPercentage: 0.3,
              barPercentage: 1,
              order: 1,
            },
            {
              label: "Female",
              backgroundColor: "rgba(245, 220, 77,1)",
              borderColor: "rgba(245, 220, 77,1)",
              borderWidth: 0,
              data: [femaleVal],
              categoryPercentage: 0.3,
              barPercentage: 1,
              order: 3,
            },
          ],
        },
        options: {
          indexAxis: "x",
          plugins: {
            title: {
              display: false,
            },
            legend: {
              // display: false,
              position: "bottom",
              labels: {
                usePointStyle: true, // Use point style (circle) for legend items
                boxWidth: 6, // Set the width of the legend items
                boxHeight: 6, // Set the height of the legend items
                padding: 20, // Set the padding between legend items
              },
            },
          },

          scales: {
            x: {
              grid: {
                display: false, // Hide vertical grid lines
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                // Chart.js v4 removed 'drawBorder' typing; cast to any to preserve visual behavior
                drawBorder: false, // Hide horizontal grid lines except the axis line
                color: "rgba(0, 0, 0, 0.1)", // Set the color of the grid lines
                borderDash: [4, 4], // Set the border dash pattern [line length, gap length]
              } as any,
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [femaleVal, maleVale]);

  return <canvas ref={chartRef} />;
});

export default BarChart;
