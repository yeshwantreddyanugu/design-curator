import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, Product, formatPrice, getStockStatus } from '@/services/productApi';
import EditProductModal from '@/components/EditProductModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
  X,
  ExternalLink,
  Tag,
  Calendar,
  Palette
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [productToView, setProductToView] = useState<Product | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(0, 50),
  });

  // Query for single product when viewing details
  const { data: productDetails, isLoading: isLoadingDetails } = useQuery<Product>({
    queryKey: ['product', productToView?.id],
    queryFn: () => productApi.getProduct(productToView!.id),
    enabled: !!productToView?.id && viewModalOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      console.log('✅ Product deletion successful');
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
      console.error('❌ Product deletion failed:', error);
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
      
      console.log(`✅ Bulk delete completed: ${successful} successful, ${failed} failed`);
      
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
      console.error('❌ Bulk delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete products. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (product: Product) => {
    console.log('👁️ View Details clicked for product:', {
      id: product.id,
      name: product.productName,
      type: product.productType,
      category: product.category
    });
    
    setProductToView(product);
    setViewModalOpen(true);
    
    toast({
      title: "Loading product details",
      description: `Fetching details for ${product.productName}`,
    });
  };

  const handleDeleteClick = (product: Product) => {
    console.log('🗑️ Delete button clicked for product:', product.id, product.productName);
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      console.log('⚠️ Confirming deletion for product:', productToDelete.id);
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const handleEditClick = (product: Product) => {
    console.log('✏️ Edit button clicked for product:', product.id, product.productName);
    setProductToEdit(product);
    setEditModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedProducts.length > 0) {
      console.log('🗑️ Bulk delete initiated for products:', selectedProducts);
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedProducts.length > 0) {
      console.log('⚠️ Confirming bulk deletion for products:', selectedProducts);
      bulkDeleteMutation.mutate(selectedProducts);
    }
  };

  const toggleProductSelection = (productId: number) => {
    console.log('☑️ Toggling selection for product:', productId);
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      console.log('📝 Updated selection:', newSelection);
      return newSelection;
    });
  };

  const toggleAllSelection = () => {
    console.log('☑️ Toggle all selection clicked');
    setSelectedProducts(prev => {
      const newSelection = prev.length === filteredProducts.length 
        ? [] 
        : filteredProducts.map(p => p.id);
      console.log('📝 All selection updated:', newSelection);
      return newSelection;
    });
  };

  const clearSelection = () => {
    console.log('🧹 Clearing all selections');
    setSelectedProducts([]);
  };

  // Filter products based on search and filters
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

  // Log filtered results when filters change
  console.log('🔍 Filtered products count:', filteredProducts.length, 'out of', products?.length || 0);

  const categories = [...new Set(products?.map(p => p.category) || [])];

  if (isLoading) {
    console.log('⏳ Loading products...');
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
    console.error('❌ Error loading products:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load products</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  console.log('📊 ProductList rendered with', products?.length || 0, 'total products');

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
                  onChange={(e) => {
                    console.log('🔍 Search term changed:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(value) => {
                console.log('🏷️ Type filter changed:', value);
                setTypeFilter(value);
              }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CLOTHES">Clothes</SelectItem>
                  <SelectItem value="SHOES">Shoes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={(value) => {
                console.log('📂 Category filter changed:', value);
                setCategoryFilter(value);
              }}>
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

              <Select value={stockFilter} onValueChange={(value) => {
                console.log('📦 Stock filter changed:', value);
                setStockFilter(value);
              }}>
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
                  const pricing = formatPrice(product.price, product.discountPrice);
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
                          {product.imageUrls.length > 0 ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                              onLoad={() => console.log('🖼️ Image loaded for:', product.productName)}
                              onError={() => console.error('❌ Image failed to load for:', product.productName)}
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
                              <p className="font-semibold text-success">{pricing.discount}</p>
                              <p className="text-sm text-muted-foreground line-through">
                                {pricing.original}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground">{pricing.original}</p>
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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => console.log('⚙️ Actions menu opened for product:', product.id)}
                            >
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
            <AlertDialogCancel onClick={() => console.log('❌ Delete cancelled')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
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
            <AlertDialogCancel onClick={() => console.log('❌ Bulk delete cancelled')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Product Modal */}
      {productToEdit && (
        <EditProductModal
          product={productToEdit}
          open={editModalOpen}
          onOpenChange={(open) => {
            console.log('📝 Edit modal state changed:', open);
            setEditModalOpen(open);
            if (!open) {
              setProductToEdit(null);
            }
          }}
        />
      )}

      {/* View Product Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={(open) => {
        console.log('👁️ View modal state changed:', open);
        setViewModalOpen(open);
        if (!open) {
          setProductToView(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="w-5 h-5" />
              Product Details
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading product details...</span>
              </div>
            </div>
          ) : productDetails ? (
            <div className="space-y-6 p-6">
              {/* Product Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Images
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {productDetails.imageUrls.length > 0 ? (
                      productDetails.imageUrls.map((url, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted border">
                          <img
                            src={url}
                            alt={`${productDetails.productName} - Image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onLoad={() => console.log(`🖼️ Image ${index + 1} loaded for product details`)}
                            onError={() => console.error(`❌ Image ${index + 1} failed to load for product details`)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 aspect-square rounded-lg bg-muted border flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {productDetails.productName}
                    </h2>
                    <p className="text-muted-foreground">{productDetails.subcategory}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Type</span>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {productDetails.productType === 'CLOTHES' ? (
                          <Shirt className="w-3 h-3" />
                        ) : (
                          <ShoppingBag className="w-3 h-3" />
                        )}
                        {productDetails.productType}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Category</span>
                      </div>
                      <Badge variant="secondary">{productDetails.category}</Badge>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Pricing</span>
                    </div>
                    <div>
                      {(() => {
                        const pricing = formatPrice(productDetails.price, productDetails.discountPrice);
                        return pricing.hasDiscount ? (
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-green-600">{pricing.discount}</p>
                            <p className="text-lg text-muted-foreground line-through">{pricing.original}</p>
                            <Badge variant="destructive" className="text-xs">
                              {Math.round(((productDetails.price - (productDetails.discountPrice || 0)) / productDetails.price) * 100)}% OFF
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-foreground">{pricing.original}</p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Stock Status</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const stockStatus = getStockStatus(productDetails.stockQuantity);
                        return (
                          <>
                            <Badge className={stockStatus.className}>
                              {stockStatus.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {productDetails.stockQuantity} units available
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colors */}
                {productDetails.colors && productDetails.colors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Available Colors</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productDetails.colors.map((color, index) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {productDetails.sizes && productDetails.sizes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Available Sizes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productDetails.sizes.map((size, index) => (
                        <Badge key={index} variant="outline" className="uppercase">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {productDetails.description && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Description</span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      {productDetails.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Product Metadata */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>Product ID: <span className="font-mono">{productDetails.id}</span></span>
                  </div>
                  {productDetails.createdAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(productDetails.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {productDetails.updatedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {new Date(productDetails.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('✏️ Edit from view modal clicked for product:', productDetails.id);
                    setViewModalOpen(false);
                    setProductToView(null);
                    setProductToEdit(productDetails);
                    setEditModalOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    console.log('🗑️ Delete from view modal clicked for product:', productDetails.id);
                    setViewModalOpen(false);
                    setProductToView(null);
                    handleDeleteClick(productDetails);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load product details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}