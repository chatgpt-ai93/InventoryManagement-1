import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertCategorySchema } from "@shared/schema";
import type { InsertCategory, Category } from "@shared/schema";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

export default function Categories() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { data: categories = [], isLoading, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const onSubmit = async (values: InsertCategory) => {
    try {
      console.log("Submitting category data:", values);
      
      // Validate required fields on frontend
      if (!values.name || !values.slug) {
        toast({
          title: "Validation Error",
          description: "Name and slug are required fields.",
          variant: "destructive",
        });
        return;
      }
      
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...values });
        toast({
          title: "Category Updated",
          description: "Category has been updated successfully.",
        });
      } else {
        const result = await createCategory.mutateAsync(values);
        console.log("Category creation result:", result);
        toast({
          title: "Category Added",
          description: "New category has been added successfully.",
        });
      }

      form.reset();
      setIsAddDialogOpen(false);
      setEditingCategory(null);
      refetch();
    } catch (error: any) {
      console.error("Category submission error:", error);
      console.error("Error details:", error);
      
      let errorMessage = `Failed to ${editingCategory ? "update" : "add"} category. Please try again.`;
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await deleteCategory.mutateAsync(categoryId);
        toast({
          title: "Category Deleted",
          description: "Category has been deleted successfully.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Category Management</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold">Category Management</h1>
          <Badge variant="secondary" data-testid="categories-count">
            {categories.length} categories
          </Badge>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              data-testid="button-add-category"
              onClick={() => {
                console.log("Add Category button clicked");
                setEditingCategory(null);
                form.reset();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter category name"
                          {...field}
                          data-testid="input-category-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="category-slug"
                          {...field}
                          data-testid="input-category-slug"
                        />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter category description"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                          data-testid="textarea-category-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    data-testid="button-cancel-category"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCategory.isPending || updateCategory.isPending}
                    data-testid="button-submit-category"
                  >
                    {createCategory.isPending || updateCategory.isPending
                      ? "Saving..."
                      : editingCategory
                      ? "Update Category"
                      : "Create Category"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No categories found</p>
            <p className="text-sm text-muted-foreground">Add your first category to get started</p>
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} data-testid={`category-card-${category.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Slug: {category.slug}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                      data-testid={`button-edit-category-${category.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {category.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {category.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}