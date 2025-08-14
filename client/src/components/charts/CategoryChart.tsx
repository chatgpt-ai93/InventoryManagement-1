import { useEffect, useRef } from "react";
import { useTopProducts } from "@/lib/api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export function CategoryChart() {
  const { data: topProducts = [], isLoading } = useTopProducts(10);

  // Group products by category and sum revenue
  const categoryData = topProducts.reduce((acc, item) => {
    const categoryName = item.product.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += item.revenue;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryData);
  const revenues = Object.values(categoryData);

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: revenues,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'hsl(var(--foreground))',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = revenues.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No category data available</p>
          <p className="text-sm">Data will appear when sales are recorded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64" data-testid="category-chart">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
