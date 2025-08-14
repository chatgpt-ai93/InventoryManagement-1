import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomers, useCreateCustomer } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertCustomerSchema } from "@shared/schema";
import { Plus, Search, Users, Award, DollarSign } from "lucide-react";
import type { InsertCustomer } from "@shared/schema";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { data: customers = [], isLoading, refetch } = useCustomers(search);
  const createCustomer = useCreateCustomer();
  const { toast } = useToast();

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      loyaltyPoints: 0,
      totalSpent: "0",
    },
  });

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => parseFloat(c.totalSpent) > 1000).length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const totalSpent = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent), 0);

  const onSubmit = async (values: InsertCustomer) => {
    try {
      await createCustomer.mutateAsync(values);
      
      toast({
        title: "Customer Added",
        description: "New customer has been added successfully.",
      });

      form.reset();
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCustomerTier = (totalSpent: string) => {
    const spent = parseFloat(totalSpent);
    if (spent >= 5000) return { name: "VIP", color: "bg-purple-100 text-purple-800" };
    if (spent >= 1000) return { name: "Gold", color: "bg-yellow-100 text-yellow-800" };
    if (spent >= 500) return { name: "Silver", color: "bg-gray-100 text-gray-800" };
    return { name: "Bronze", color: "bg-orange-100 text-orange-800" };
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold text-foreground">{totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">VIP Customers</p>
                <p className="text-3xl font-bold text-warning">{vipCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Award className="text-warning h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Loyalty Points</p>
                <p className="text-3xl font-bold text-success">{totalLoyaltyPoints.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Award className="text-success h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-success h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold">Customer Management</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-10 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-customers"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-customer">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer name" {...field} data-testid="input-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="customer@email.com" {...field} data-testid="input-customer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-0123" {...field} data-testid="input-customer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer address" {...field} data-testid="input-customer-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer city" {...field} data-testid="input-customer-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel-customer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCustomer.isPending}
                      data-testid="button-submit-customer"
                    >
                      {createCustomer.isPending ? "Adding..." : "Add Customer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="customers-table">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Tier</th>
                  <th className="text-left p-4 font-medium">Loyalty Points</th>
                  <th className="text-left p-4 font-medium">Total Spent</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="border-b border-border animate-pulse">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                            <div className="h-3 bg-muted rounded w-20"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </td>
                      <td className="p-4"><div className="h-6 bg-muted rounded w-16"></div></td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-12"></div></td>
                      <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                      <td className="p-4"><div className="h-8 bg-muted rounded w-20"></div></td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      {search ? "No customers found matching your search" : "No customers yet"}
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const tier = getCustomerTier(customer.totalSpent);
                    
                    return (
                      <tr key={customer.id} className="border-b border-border hover:bg-muted/50" data-testid={`customer-row-${customer.id}`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="text-foreground">{customer.email}</div>
                            <div className="text-muted-foreground">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={tier.color}>{tier.name}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-foreground">
                            {customer.loyaltyPoints.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-foreground">
                            {formatCurrency(parseFloat(customer.totalSpent))}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-customer-${customer.id}`}
                          >
                            View Details
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
    </div>
  );
}
