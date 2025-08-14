import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { ProductWithDetails } from "@shared/schema";

interface ProductGridProps {
  products: ProductWithDetails[];
  onAddToCart: (productId: string) => void;
  isLoading: boolean;
}

export function ProductGrid({ products, onAddToCart, isLoading }: ProductGridProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getStockStatus = (product: ProductWithDetails) => {
    if (!product.trackStock) return null;
    if (product.quantity === 0) return { label: "Out of Stock", color: "destructive" as const };
    if (product.quantity <= product.minStockLevel) return { label: "Low Stock", color: "warning" as const };
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, index) => (
          <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
            <div className="w-full h-32 bg-muted rounded-lg mb-3"></div>
            <div className="h-4 bg-muted rounded mb-1"></div>
            <div className="h-3 bg-muted rounded w-16 mb-2"></div>
            <div className="h-5 bg-muted rounded w-20 mb-1"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        const isOutOfStock = product.trackStock && product.quantity === 0;
        
        return (
          <div
            key={product.id}
            className={`border border-border rounded-lg p-4 transition-shadow cursor-pointer ${
              isOutOfStock 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-md'
            }`}
            onClick={() => !isOutOfStock && onAddToCart(product.id)}
            data-testid={`product-card-${product.id}`}
          >
            <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-1">
              <h4 className="font-medium text-foreground text-sm line-clamp-2">
                {product.name}
              </h4>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(product.sellingPrice)}
                </p>
                {stockStatus && (
                  <Badge 
                    variant={stockStatus.color === "warning" ? "secondary" : stockStatus.color}
                    className={stockStatus.color === "warning" ? "bg-warning text-warning-foreground" : ""}
                  >
                    {stockStatus.label}
                  </Badge>
                )}
              </div>
              
              {product.trackStock && (
                <p className={`text-xs ${
                  stockStatus?.color === "destructive" ? "text-destructive" :
                  stockStatus?.color === "warning" ? "text-warning" : "text-muted-foreground"
                }`}>
                  Stock: {product.quantity}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
