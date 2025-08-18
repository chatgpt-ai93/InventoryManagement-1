import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProduct, useCreateProduct, useUpdateProduct, useCategories, useSuppliers } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertProductSchema, supportedCurrencies, defaultCurrency } from "@shared/schema";
import type { InsertProduct, CurrencyCode } from "@shared/schema";

interface ProductFormProps {
  productId?: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function ProductForm({ productId, onSaved, onCancel }: ProductFormProps) {
  const { data: product } = useProduct(productId || "");
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { toast } = useToast();

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      description: "",
      categoryId: "",
      supplierId: "",
      costPrice: "0",
      sellingPrice: "0",
      currency: defaultCurrency,
      quantity: 0,
      minStockLevel: 10,
      trackStock: true,
      isActive: true,
      imageUrl: "",
    },
  });

  // Reset form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
        costPrice: product.costPrice || "0",
        sellingPrice: product.sellingPrice || "0",
        currency: product.currency || defaultCurrency,
        quantity: product.quantity || 0,
        minStockLevel: product.minStockLevel || 10,
        trackStock: product.trackStock ?? true,
        isActive: product.isActive ?? true,
        imageUrl: product.imageUrl || "",
      });
    }
  }, [product, form]);

  const onSubmit = async (values: InsertProduct) => {
    try {
      // Clean up the data - convert empty strings to null for optional fields
      const cleanedValues = {
        ...values,
        barcode: values.barcode || null,
        categoryId: values.categoryId || null,
        supplierId: values.supplierId || null,
        imageUrl: values.imageUrl || null,
      };

      if (productId) {
        await updateProduct.mutateAsync({ id: productId, ...cleanedValues });
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
      } else {
        await createProduct.mutateAsync(cleanedValues);
        toast({
          title: "Product Created",
          description: "New product has been created successfully.",
        });
      }
      onSaved();
    } catch (error) {
      console.log("Product form submission error:", error);
      toast({
        title: "Error",
        description: `Failed to ${productId ? "update" : "create"} product. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} data-testid="input-product-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} data-testid="input-product-sku" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter barcode" {...field} data-testid="input-product-barcode" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="resize-none"
                  {...field}
                  data-testid="textarea-product-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="select-product-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id || "none"}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="select-product-supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id || "none"}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    data-testid="input-product-cost-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    data-testid="input-product-selling-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || defaultCurrency}>
                  <FormControl>
                    <SelectTrigger data-testid="select-product-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(supportedCurrencies).map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        {currency.symbol} {currency.name} ({code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    data-testid="input-product-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    data-testid="input-product-min-stock"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  data-testid="input-product-image-url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="trackStock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-track-stock"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Track Stock</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Enable stock tracking for this product
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-is-active"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Product is available for sale
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-product"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-submit-product"
          >
            {isSubmitting ? "Saving..." : productId ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
