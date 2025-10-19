import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, Product, getStockStatus } from '@/services/productApi';
import EditProductModal from '@/components/EditProductModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  Loader2,
  Package,
  Shirt,
  ShoppingBag,
  IndianRupee,
  Palette,
  Calendar,
  Tag,
  FileText,
  Ruler,
  Box
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper function to format price with rupee symbol
const formatPriceWithRupee = (price: number, discountPercent?: number | null) => {
  const formatNumber = (num: number) => `₹${num.toFixed(2)}`;
  
  if (discountPercent && discountPercent > 0 && discountPercent < 100) {
    const discountAmount = (price * discountPercent) / 100;
    const finalPrice = price - discountAmount;
    return {
      hasDiscount: true,
      finalPrice: formatNumber(finalPrice),
      original: formatNumber(price),
      discountPercent: `${discountPercent}%`,
      savings: formatNumber(discountAmount)
    };
  }
  
  return {
    hasDiscount: false,
    finalPrice: formatNumber(price),
    original: formatNumber(price),
    discountPercent: null,
    savings: null
  };
};

// View Product Modal Component
function ViewProductModal({ product, open, onOpenChange }: { product: Product | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!product) return null;

  const pricing = formatPriceWithRupee(product.price, product.discountPrice);
  const stockStatus = getStockStatus(product.stockQuantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6" />
            View Product - {product.productName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Images */}
          {product.imageUrls && product.imageUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Product Images</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.imageUrls.map((url, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted border">
                    <img
                      src={url}
                      alt={`${product.productName} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Basic Information</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
                  <p className="text-foreground">{product.productName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit mt-1">
                    {product.productType === 'CLOTHES' ? (
                      <Shirt className="w-3 h-3" />
                    ) : (
                      <ShoppingBag className="w-3 h-3" />
                    )}
                    {product.productType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-foreground">{product.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subcategory</Label>
                  <p className="text-foreground">{product.subcategory}</p>
                </div>
                {product.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-foreground text-sm">{product.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <IndianRupee className="w-4 h-4" />
                <span>Pricing & Stock</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                  <div className="space-y-1">
                    {pricing.hasDiscount ? (
                      <>
                        <p className="font-semibold text-success text-xl">{pricing.finalPrice}</p>
                        <p className="text-sm text-muted-foreground line-through">{pricing.original}</p>
                        <Badge variant="secondary" className="text-xs">
                          {pricing.discountPercent} OFF
                        </Badge>
                      </>
                    ) : (
                      <p className="font-semibold text-foreground text-xl">{pricing.finalPrice}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Stock Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={stockStatus.className}>
                      {stockStatus.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {product.stockQuantity} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colors & Sizes */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Options</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.availableColors && product.availableColors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Available Colors</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.availableColors.map((color, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Available Sizes</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.availableSizes.map((size, index) => (
                      <Badge key={index} variant="outline" className="uppercase">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.createdAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-foreground">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {product.updatedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-foreground">{new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(0, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: productApi.bulkDeleteProducts,
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      
      if (failed === 0) {
        toast({
          title: "Products deleted",
          description: `${successful} product(s) deleted successfully.`,
        });
      } else {
        toast({
          title: "Partial success",
          description: `${successful} deleted, ${failed} failed.`,
          variant: "destructive",
        });
      }
      
      setSelectedProducts([]);
      setBulkDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete products. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (product: Product) => {
    setProductToView(product);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setEditModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedProducts.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedProducts.length > 0) {
      bulkDeleteMutation.mutate(selectedProducts);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedProducts(prev =>
      prev.length === filteredProducts.length
        ? []
        : filteredProducts.map(p => p.id)
    );
  };

  const clearSelection = () => setSelectedProducts([]);

  // Filter products
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || product.productType === typeFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const stockStatus = getStockStatus(product.stockQuantity);
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'in' && stockStatus.status === 'in') ||
      (stockFilter === 'low' && stockStatus.status === 'low') ||
      (stockFilter === 'out' && stockStatus.status === 'out');

    return matchesSearch && matchesType && matchesCategory && matchesStock;
  }) || [];

  const categories = [...new Set(products?.map(p => p.category) || [])];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load products</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} of {products?.length || 0} products
          </p>
        </div>
        <Link to="/admin/products/create">
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CLOTHES">Clothes</SelectItem>
                  <SelectItem value="SHOES">Shoes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedProducts.length} product(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedProducts.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Product Collection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const pricing = formatPriceWithRupee(product.price, product.discountPrice);
                  const stockStatus = getStockStatus(product.stockQuantity);
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50 transition-smooth">
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {product.imageUrls && product.imageUrls.length > 0 ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">{product.subcategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {product.productType === 'CLOTHES' ? (
                            <Shirt className="w-3 h-3" />
                          ) : (
                            <ShoppingBag className="w-3 h-3" />
                          )}
                          {product.productType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {pricing.hasDiscount ? (
                            <>
                              <p className="font-semibold text-success">{pricing.finalPrice}</p>
                              <p className="text-sm text-muted-foreground line-through">
                                {pricing.original}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {pricing.discountPercent} OFF
                              </Badge>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground">{pricing.finalPrice}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.className}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(product)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || stockFilter !== 'all'
                    ? 'Try adjusting your filters to see more products.'
                    : 'Get started by adding your first product.'}
                </p>
                <Link to="/admin/products/create">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Product Modal */}
      <ViewProductModal
        product={productToView}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Edit Product Modal */}
      {productToEdit && (
        <EditProductModal
          product={productToEdit}
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) {
              setProductToEdit(null);
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.productName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProducts.length} product(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedProducts.length} Product(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
