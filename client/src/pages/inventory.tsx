import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProducts, useAdjustStock } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Warehouse, Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const adjustStockSchema = z.object({
  quantity: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), "Must be a valid number"),
  reason: z.string().min(1, "Reason is required"),
});

export default function Inventory() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  
  const { data: products = [], isLoading, refetch } = useProducts();
  const adjustStock = useAdjustStock();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof adjustStockSchema>>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      quantity: 0,
      reason: "",
    },
  });

  const lowStockProducts = products.filter(p => p.trackStock && p.quantity <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.trackStock && p.quantity === 0);
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.sellingPrice) * p.quantity), 0);

  const handleAdjustStock = (productId: string) => {
    setSelectedProduct(productId);
    setIsAdjustDialogOpen(true);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof adjustStockSchema>) => {
    if (!selectedProduct) return;

    try {
      await adjustStock.mutateAsync({
        id: selectedProduct,
        quantity: values.quantity,
        reason: values.reason,
      });

      toast({
        title: "Stock Adjusted",
        description: "Product stock has been updated successfully.",
      });

      setIsAdjustDialogOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold text-foreground">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-3xl font-bold text-warning">{lowStockProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-warning h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-3xl font-bold text-destructive">{outOfStockProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Package className="text-destructive h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Warehouse className="text-success h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="inventory-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">SKU</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Current Stock</th>
                  <th className="text-left p-4 font-medium">Min Level</th>
                  <th className="text-left p-4 font-medium">Value</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="border-b border-border animate-pulse">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-20"></div></td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-12"></div></td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-12"></div></td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                      <td className="p-4"><div className="h-6 bg-muted rounded w-20"></div></td>
                      <td className="p-4"><div className="h-8 bg-muted rounded w-20"></div></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockStatus = product.quantity === 0 ? 'out' : 
                      product.quantity <= product.minStockLevel ? 'low' : 'good';
                    
                    return (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/50" data-testid={`inventory-row-${product.id}`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-foreground">{product.sku}</td>
                        <td className="p-4 text-muted-foreground">{product.category?.name}</td>
                        <td className="p-4">
                          <span className={`font-medium ${
                            stockStatus === 'out' ? 'text-destructive' : 
                            stockStatus === 'low' ? 'text-warning' : 'text-foreground'
                          }`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.minStockLevel}</td>
                        <td className="p-4 text-foreground">
                          {formatCurrency(parseFloat(product.sellingPrice) * product.quantity)}
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={stockStatus === 'out' ? 'destructive' : stockStatus === 'low' ? 'secondary' : 'default'}
                            className={stockStatus === 'low' ? 'bg-warning text-warning-foreground' : ''}
                          >
                            {stockStatus === 'out' ? 'Out of Stock' : 
                             stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustStock(product.id)}
                            data-testid={`button-adjust-stock-${product.id}`}
                          >
                            Adjust Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedProductData?.name}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {selectedProductData && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold">{selectedProductData.quantity} units</p>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjustment Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter positive or negative number"
                        {...field}
                        data-testid="input-adjustment-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why you're adjusting the stock..."
                        {...field}
                        data-testid="textarea-adjustment-reason"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustDialogOpen(false)}
                  data-testid="button-cancel-adjustment"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adjustStock.isPending}
                  data-testid="button-submit-adjustment"
                >
                  {adjustStock.isPending ? "Adjusting..." : "Adjust Stock"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
