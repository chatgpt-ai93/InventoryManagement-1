import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSale } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, Banknote, University, Pause, Printer, Check } from "lucide-react";
import type { CartItem, Customer } from "@shared/schema";

interface CartProps {
  items: CartItem[];
  customers: Customer[];
  selectedCustomer: string | null;
  onCustomerChange: (customerId: string | null) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function Cart({
  items,
  customers,
  selectedCustomer,
  onCustomerChange,
  paymentMethod,
  onPaymentMethodChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  taxAmount,
  total,
}: CartProps) {
  const createSale = useCreateSale();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before completing sale",
        variant: "destructive",
      });
      return;
    }

    try {
      const saleData = {
        customerId: selectedCustomer && selectedCustomer !== "walk-in" ? selectedCustomer : null,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: "0.00",
        total: total.toFixed(2),
        paymentMethod,
        status: "completed" as const,
      };

      const saleItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: item.totalPrice.toFixed(2),
      }));

      await createSale.mutateAsync({ sale: saleData, items: saleItems });

      toast({
        title: "Sale Completed",
        description: `Transaction completed successfully for ${formatCurrency(total)}`,
      });

      onClearCart();
      onCustomerChange(null);
    } catch (error) {
      toast({
        title: "Sale Failed",
        description: "Failed to complete sale. Please try again.",
        variant: "destructive",
      });
    }
  };

  const paymentMethods = [
    { id: "cash", name: "Cash", icon: Banknote },
    { id: "card", name: "Card", icon: CreditCard },
    { id: "transfer", name: "Transfer", icon: University },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
        </CardTitle>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-destructive hover:text-destructive"
            data-testid="button-clear-cart"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 min-h-0">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add products to start a sale</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                data-testid={`cart-item-${item.productId}`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.unitPrice)} each
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.productId, -1)}
                    data-testid={`button-decrease-${item.productId}`}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center font-medium text-sm">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.productId, 1)}
                    data-testid={`button-increase-${item.productId}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive ml-2"
                    onClick={() => onRemoveItem(item.productId)}
                    data-testid={`button-remove-${item.productId}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right ml-3">
                  <p className="font-semibold text-foreground text-sm">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <>
            {/* Cart Totals */}
            <div className="border-t border-border pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.5%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Customer & Payment */}
            <div className="space-y-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Customer
                </Label>
                <Select value={selectedCustomer || undefined} onValueChange={onCustomerChange}>
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Walk-in Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id || "none"}>
                        {customer.name} {parseFloat(customer.totalSpent) > 1000 && "(VIP)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Payment Method
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Button
                        key={method.id}
                        variant={paymentMethod === method.id ? "default" : "outline"}
                        className="flex flex-col items-center p-3 h-auto"
                        onClick={() => onPaymentMethodChange(method.id)}
                        data-testid={`button-payment-${method.id}`}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{method.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-base font-semibold bg-success hover:bg-success/90"
                onClick={handleCompleteSale}
                disabled={createSale.isPending}
                data-testid="button-complete-sale"
              >
                <Check className="mr-2 h-5 w-5" />
                {createSale.isPending ? "Processing..." : `Complete Sale - ${formatCurrency(total)}`}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                  data-testid="button-hold-sale"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  Hold
                </Button>
                <Button
                  variant="outline"
                  data-testid="button-print-receipt"
                >
                  <Printer className="mr-1 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
