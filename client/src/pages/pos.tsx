import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { Cart } from "@/components/pos/Cart";
import { useProducts, useCustomers } from "@/lib/api";
import { Search, Scan, ShoppingCart } from "lucide-react";
import type { CartItem } from "@shared/schema";

export default function POS() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { data: products = [], isLoading: productsLoading } = useProducts({
    search: searchQuery || undefined,
  });

  const { data: customers = [] } = useCustomers();

  const categories = [
    { id: "all", name: "All" },
    { id: "electronics", name: "Electronics" },
    { id: "accessories", name: "Accessories" },
    { id: "office-supplies", name: "Office" },
  ];

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId,
        product,
        quantity: 1,
        unitPrice: parseFloat(product.sellingPrice),
        totalPrice: parseFloat(product.sellingPrice),
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) {
          return null;
        }
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice,
        };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.085; // 8.5%
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      {/* Product Search & Categories */}
      <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search or scan barcode..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-product-search"
                />
              </div>
              <Button data-testid="button-scan-barcode">
                <Scan className="mr-2 h-4 w-4" />
                Scan
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Category Tabs */}
          <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className={`flex-1 ${selectedCategory === category.id ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`tab-category-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="overflow-y-auto max-h-96">
            <ProductGrid
              products={products}
              onAddToCart={addToCart}
              isLoading={productsLoading}
            />
          </div>
        </CardContent>
      </div>

      {/* Cart & Checkout */}
      <Cart
        items={cart}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onCustomerChange={setSelectedCustomer}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
      />
    </div>
  );
}
