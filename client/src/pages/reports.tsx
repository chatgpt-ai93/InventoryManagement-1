import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesChart } from "@/components/charts/SalesChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { useDashboardMetrics, useTopProducts, useSalesData } from "@/lib/api";
import { Download, TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("30");
  const [reportType, setReportType] = useState("revenue");

  const { data: metrics } = useDashboardMetrics();
  const { data: topProducts = [] } = useTopProducts(10);
  const { data: salesData = [] } = useSalesData(parseInt(timeRange));

  const exportReport = () => {
    // Generate CSV report based on current view
    let csvContent = "";
    let filename = "";

    if (reportType === "revenue") {
      csvContent = [
        ["Date", "Sales", "Transactions"].join(","),
        ...salesData.map(day => [day.date, day.sales.toFixed(2), day.transactions].join(","))
      ].join("\n");
      filename = `sales-report-${timeRange}days.csv`;
    } else if (reportType === "products") {
      csvContent = [
        ["Product", "SKU", "Total Sold", "Revenue"].join(","),
        ...topProducts.map(item => [
          `"${item.product.name}"`,
          item.product.sku,
          item.totalSold,
          item.revenue.toFixed(2)
        ].join(","))
      ].join("\n");
      filename = `top-products-report.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const totalRevenue = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0);
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const previousPeriodRevenue = totalRevenue * 0.85; // Sample comparison data
  const revenueGrowth = ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} data-testid="button-export-report">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-success flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {formatPercentage(revenueGrowth)} vs last period
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue * 0.36)}</p>
                <p className="text-sm text-success flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  36% margin
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-success h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{totalTransactions}</p>
                <p className="text-sm text-primary flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +15.3% vs last period
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-warning h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(avgOrderValue)}</p>
                <p className="text-sm text-success flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +3.2% vs last period
                </p>
              </div>
              <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-error h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Trend</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === "30" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30")}
                data-testid="button-30d"
              >
                30D
              </Button>
              <Button
                variant={timeRange === "90" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90")}
                data-testid="button-90d"
              >
                90D
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SalesChart days={parseInt(timeRange)} />
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((item, index) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between"
                  data-testid={`top-product-report-${item.product.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">{item.product.category?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(item.revenue)}</p>
                    <p className="text-sm text-success">+25%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Best Sales Day</p>
                <p className="font-semibold text-foreground">
                  {salesData.length > 0 
                    ? new Date(salesData.reduce((max, day) => day.sales > max.sales ? day : max).date).toLocaleDateString()
                    : "N/A"
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">
                  {salesData.length > 0 
                    ? formatCurrency(Math.max(...salesData.map(d => d.sales)))
                    : "$0.00"
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Average Daily Sales</p>
                <p className="font-semibold text-foreground">
                  {salesData.length > 0 ? "Past " + timeRange + " days" : "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatCurrency(totalRevenue / (salesData.length || 1))}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="font-semibold text-foreground">vs. Previous Period</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">{formatPercentage(revenueGrowth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
