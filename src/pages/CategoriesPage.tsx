import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import CategoryList from "@/components/categories/category-list"
import CategoryForm from "@/components/categories/category-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories"
import { Category } from "@/api"

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleAddCategory = (category: Omit<Category, "id">) => {
    createMutation.mutate(category);
  }

  const handleUpdateCategory = (updatedCategory: Category) => {
    updateMutation.mutate(updatedCategory);
    setEditingCategory(null);
  }

  const handleDeleteCategory = (id: number) => {
    deleteMutation.mutate(id);
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading categories</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage and organize your task categories</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              onSubmit={handleAddCategory} 
              isSubmitting={createMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
          <CardDescription>Manage your task categories and their colors</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList 
            categories={categories} 
            onEdit={handleEditCategory} 
            onDelete={handleDeleteCategory} 
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSubmit={(updatedCategory) => handleUpdateCategory({ ...updatedCategory, id: editingCategory.id })}
              isSubmitting={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}