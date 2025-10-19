import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi, Product, formatFileSize, getImageDimensions } from '@/services/productApi';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  X,
  Save,
  Loader2,
  Package,
  Palette,
  DollarSign,
  Shirt,
  ShoppingBag, 
  BedDouble, 
  Home, 
  Utensils, 
  Lamp, 
  Gift, 
  Smile,
  AlertTriangle
} from 'lucide-react';


const CATEGORIES = {
  CLOTHES: ['Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Accessories'],
  SHOES: ['Sports', 'Casual', 'Formal', 'Kids Shoes']
};
const AVAILABLE_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Green',
  'Yellow', 'Purple', 'Pink', 'Orange', 'Gray', 'Brown', 'Navy'
];
const SIZES = {
  CLOTHES: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  SHOES: ['6', '7', '8', '9', '10', '11', '12']
};


const editProductSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  productType: z.enum([
    'CLOTHES',
    'SHOES',
    'FURNITURE',
    'FURNISHINGS',
    'LIFESTYLE',
    'KITCHEN_DINING',
    'DECOR_ACCESSORIES',
    'GIFTING',
    'KIDS'
  ]),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discountPrice: z.number().min(0).optional(),
  availableColors: z.array(z.string()).min(1, 'Select at least one color'),
  availableSizes: z.array(z.string()).min(1, 'Select at least one size'),
  description: z.string(),
  stockQuantity: z.number().min(0, 'Stock must be 0 or greater'),
});


type EditProductForm = z.infer<typeof editProductSchema>;


interface EditProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


interface ImageFile {
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}


export default function EditProductModal({ product, open, onOpenChange }: EditProductModalProps) {
  const [newImages, setNewImages] = useState<ImageFile[]>([]);
  const [replaceAllImages, setReplaceAllImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      productName: product.productName,
      productType: product.productType,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      availableColors: product.availableColors,
      availableSizes: product.availableSizes,
      description: product.description,
      stockQuantity: product.stockQuantity,
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        productName: product.productName,
        productType: product.productType,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
        discountPrice: product.discountPrice || 0,
        availableColors: product.availableColors,
        availableSizes: product.availableSizes,
        description: product.description,
        stockQuantity: product.stockQuantity,
      });
      setNewImages([]);
      setReplaceAllImages(false);
    }
  }, [product, form, open]);

  const updateMutation = useMutation({
    mutationFn: (data: EditProductForm) => {
      if (newImages.length > 0) {
        return productApi.updateProductWithImages(
          product.id,
          data,
          newImages.map(img => img.file),
          replaceAllImages
        );
      } else {
        return productApi.updateProduct(product.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      onOpenChange(false);
      setNewImages([]);
      setReplaceAllImages(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newImageFiles: ImageFile[] = [];

    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        const dimensions = await getImageDimensions(file);
        newImageFiles.push({ file, preview, dimensions });
      }
    }

    setNewImages(prev => [...prev, ...newImageFiles].slice(0, 5));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const onSubmit = (data: EditProductForm) => {
    updateMutation.mutate(data);
  };

  const currentProductType = form.watch('productType');
  const availableCategories = CATEGORIES[currentProductType] || [];
  const availableSizes = SIZES[currentProductType] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Edit Product</span>
          </DialogTitle>
          <DialogDescription>
            Update the product information and upload new images if needed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Product Details</span>
                </h3>

                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FURNITURE">
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-4 h-4" />
                              Furniture
                            </div>
                          </SelectItem>
                          <SelectItem value="FURNISHINGS">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              Furnishings
                            </div>
                          </SelectItem>
                          <SelectItem value="LIFESTYLE">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Lifestyle
                            </div>
                          </SelectItem>
                          <SelectItem value="KITCHEN_DINING">
                            <div className="flex items-center gap-2">
                              <Utensils className="w-4 h-4" />
                              Kitchen &amp; Dining
                            </div>
                          </SelectItem>
                          <SelectItem value="DECOR_ACCESSORIES">
                            <div className="flex items-center gap-2">
                              <Lamp className="w-4 h-4" />
                              Decor Accessories
                            </div>
                          </SelectItem>
                          <SelectItem value="GIFTING">
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4" />
                              Gifting
                            </div>
                          </SelectItem>
                          <SelectItem value="KIDS">
                            <div className="flex items-center gap-2">
                              <Smile className="w-4 h-4" />
                              Kids
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Pricing & Stock</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Colors */}
                <FormField
                  control={form.control}
                  name="availableColors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Colors</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          {AVAILABLE_COLORS.map((color) => (
                            <Badge
                              key={color}
                              variant={field.value.includes(color) ? "default" : "outline"}
                              className="cursor-pointer justify-center py-1 text-xs"
                              onClick={() => {
                                const newColors = field.value.includes(color)
                                  ? field.value.filter(c => c !== color)
                                  : [...field.value, color];
                                field.onChange(newColors);
                              }}
                            >
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sizes */}
                <FormField
                  control={form.control}
                  name="availableSizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Sizes</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-6 gap-2">
                          {availableSizes.map((size) => (
                            <Badge
                              key={size}
                              variant={field.value.includes(size) ? "default" : "outline"}
                              className="cursor-pointer justify-center py-1"
                              onClick={() => {
                                const newSizes = field.value.includes(size)
                                  ? field.value.filter(s => s !== size)
                                  : [...field.value, size];
                                field.onChange(newSizes);
                              }}
                            >
                              {size}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Current Images */}
            {product.imageUrls.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Current Images</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {product.imageUrls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Current ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MANDATORY WARNING BANNER */}
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <AlertTitle className="text-amber-900 dark:text-amber-100 font-bold text-base">
                ⚠️ MANDATORY: Image Re-upload Required
              </AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-200 space-y-2 mt-2">
                <p className="font-semibold text-sm">
                  Even if current images are displayed above, you MUST re-upload product images to save any changes.
                </p>
                <div className="text-xs space-y-1 pl-4 border-l-2 border-amber-400 mt-2">
                  <p>✓ <strong>Re-uploading images is mandatory</strong> - Changes cannot be saved without new images</p>
                  <p>✓ Upload at least 1 image (maximum 5 images allowed)</p>
                  <p>✓ Previous images will be replaced with newly uploaded ones</p>
                  <p>✓ Accepted formats: JPG, PNG, WEBP (max 5MB per image)</p>
                  <p>✓ This applies even if you're only editing text fields like price or description</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* New Images Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload New Images <span className="text-destructive text-xl">*</span>
                </h3>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-smooth cursor-pointer ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : newImages.length === 0 
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/10' 
                      : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('new-image-upload')?.click()}
              >
                <input
                  id="new-image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={newImages.length >= 5}
                />
                <Upload className={`w-8 h-8 mx-auto mb-2 ${newImages.length === 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-medium ${newImages.length === 0 ? 'text-amber-900 dark:text-amber-100' : 'text-foreground'}`}>
                  {newImages.length >= 5
                    ? 'Maximum 5 images reached'
                    : newImages.length === 0
                      ? '⚠️ REQUIRED: Click or drag images here to upload'
                      : `${newImages.length} image(s) uploaded - Add more (max 5)`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP
                </p>
              </div>

              {newImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {newImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-green-500">
                        <img
                          src={image.preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-smooth"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <p className="truncate">{image.file.name}</p>
                        <p>{formatFileSize(image.file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || newImages.length === 0}
                className="bg-gradient-primary hover:opacity-90"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
