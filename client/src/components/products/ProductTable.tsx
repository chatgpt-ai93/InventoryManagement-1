import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { useDeleteProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Package, Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductWithDetails, CurrencyCode } from "@shared/schema";

interface ProductTableProps {
  products: ProductWithDetails[];
  isLoading: boolean;
  onEdit: (productId: string) => void;
  onRefresh: () => void;
}

export function ProductTable({ products, isLoading, onEdit, onRefresh }: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  // Remove old formatCurrency function since we'll use CurrencyDisplay component

  const getStockStatus = (product: ProductWithDetails) => {
    if (!product.trackStock) return { label: "Not Tracked", variant: "secondary" as const };
    if (product.quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (product.quantity <= product.minStockLevel) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(productId);
        toast({
          title: "Product Deleted",
          description: "Product has been deleted successfully.",
        });
        onRefresh();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const allSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.has(p.id));
  const someSelected = paginatedProducts.some(p => selectedProducts.has(p.id));

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="products-table-loading">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-left">
                <div className="w-4 h-4 bg-muted rounded"></div>
              </th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array(5).fill(0).map((_, index) => (
              <tr key={index} className="border-b border-border animate-pulse">
                <td className="p-4"><div className="w-4 h-4 bg-muted rounded"></div></td>
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
                <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-muted rounded w-12"></div></td>
                <td className="p-4"><div className="h-6 bg-muted rounded w-20"></div></td>
                <td className="p-4"><div className="h-8 bg-muted rounded w-24"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="products-table">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-left">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  data-testid="checkbox-select-all"
                />
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                SKU
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Price
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Stock
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="p-4 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  No products found
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border hover:bg-muted/50"
                    data-testid={`product-row-${product.id}`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        data-testid={`checkbox-product-${product.id}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
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
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{product.sku}</td>
                    <td className="p-4 text-muted-foreground">{product.category?.name || "—"}</td>
                    <td className="p-4 text-foreground">
                      <CurrencyDisplay 
                        amount={product.sellingPrice} 
                        currency={product.currency as CurrencyCode} 
                      />
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${
                        stockStatus.variant === "destructive" ? "text-destructive" :
                        product.quantity <= product.minStockLevel ? "text-warning" : "text-foreground"
                      }`}>
                        {product.trackStock ? product.quantity : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={stockStatus.variant}
                        className={product.quantity <= product.minStockLevel && product.quantity > 0 ? "bg-warning text-warning-foreground" : ""}
                      >
                        {stockStatus.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(product.id)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`button-view-${product.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
                          data-testid={`button-delete-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-card px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    data-testid={`button-page-${pageNumber}`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
