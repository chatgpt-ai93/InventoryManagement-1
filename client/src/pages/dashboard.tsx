import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics, useTopProducts, useLowStockProducts } from "@/lib/api";
import { SalesChart } from "@/components/charts/SalesChart";
import { formatCurrency } from "@shared/schema";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUp,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts(4);
  const { data: lowStockProducts, isLoading: lowStockLoading } = useLowStockProducts();

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Use shared formatCurrency function for proper Indian Rupee formatting

  const formatPercentage = (percentage: number | undefined) => {
    if (!percentage && percentage !== 0) return '+0.0%';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics ? formatCurrency(metrics.todaySales) : '$0.00'}
                </p>
                <p className="text-sm text-success flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  {formatPercentage(metrics?.salesGrowth)} from yesterday
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
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics?.todayTransactions || 0}
                </p>
                <p className="text-sm text-primary flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  {formatPercentage(metrics?.transactionGrowth)} from yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics?.totalProducts || 0}
                </p>
                <p className="text-sm text-warning flex items-center mt-1">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {metrics?.lowStockCount || 0} low stock
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Package className="text-warning h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics?.totalCustomers || 0}
                </p>
                <p className="text-sm text-success flex items-center mt-1">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  {metrics ? formatPercentage(metrics.customerGrowth) : '+0%'} this week
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="text-success h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sales Trend (7 Days)</CardTitle>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardHeader>
          <CardContent>
            <SalesChart days={7} />
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : topProducts && topProducts.length > 0 ? (
                topProducts.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between"
                    data-testid={`top-product-${item.product.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{item.totalSold} sold</p>
                      <p className="text-sm text-success">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Badge variant="destructive" data-testid="low-stock-count">
                {lowStockProducts?.length || 0} items
              </Badge>
            </div>
            <Button variant="outline" size="sm" data-testid="button-view-all-alerts">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-muted rounded"></div>
                      <div>
                        <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded w-12 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-8"></div>
                    </div>
                  </div>
                ))
              ) : lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      product.quantity === 0
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-warning/10 border border-warning/20'
                    }`}
                    data-testid={`low-stock-product-${product.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          product.quantity === 0 ? 'text-destructive' : 'text-warning'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          product.quantity === 0 ? 'text-destructive' : 'text-warning'
                        }`}
                      >
                        {product.quantity} left
                      </p>
                      <p className="text-sm text-muted-foreground">Min: {product.minStockLevel}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>All products are well stocked</p>
                </div>
              )}
            </div>
            {lowStockProducts && lowStockProducts.length > 3 && (
              <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-low-stock">
                View All {lowStockProducts.length} Low Stock Items
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3" data-testid="activity-sale-completed">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="text-success h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Sale completed - Invoice #INV-001247</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago • $125.50</p>
                </div>
              </div>

              <div className="flex items-start space-x-3" data-testid="activity-stock-adjusted">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="text-warning h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Stock adjusted - Wireless Headphones</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago • +50 units</p>
                </div>
              </div>

              <div className="flex items-start space-x-3" data-testid="activity-customer-registered">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="text-primary h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">New customer registered - Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">1 hour ago • Customer #C-001842</p>
                </div>
              </div>

              <div className="flex items-start space-x-3" data-testid="activity-return-processed">
                <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="text-destructive h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">Return processed - Phone Case Pro</p>
                  <p className="text-xs text-muted-foreground">2 hours ago • Refund $30.00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
