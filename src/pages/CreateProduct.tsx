import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productApi, CreateProductRequest, getImageDimensions, formatFileSize } from '@/services/productApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  X, 
  FileImage, 
  Package,
  DollarSign,
  Palette,
  Save,
  ArrowLeft,
  Shirt,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ImageFile {
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}

const PRODUCT_TYPES = ['CLOTHES', 'SHOES'];
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

export default function CreateProduct() {
  const [formData, setFormData] = useState<CreateProductRequest>({
    productName: '',
    productType: 'CLOTHES',
    category: '',
    subcategory: '',
    price: 0,
    discountPrice: 0,
    availableColors: [],
    availableSizes: [],
    description: '',
    stockQuantity: 0,
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ productData, imageFiles }: { productData: CreateProductRequest; imageFiles: File[] }) =>
      productApi.createProductWithImages(productData, imageFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
      toast({
        title: "Product created successfully",
        description: "Your new product has been added to the catalog.",
      });
      navigate('/admin/products');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        const dimensions = await getImageDimensions(file);
        newImages.push({ file, preview, dimensions });
      }
    }

    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(color)
        ? prev.availableColors.filter(c => c !== color)
        : [...prev.availableColors, color],
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter(s => s !== size)
        : [...prev.availableSizes, size],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.category || !formData.subcategory || 
        formData.availableColors.length === 0 || formData.availableSizes.length === 0 || 
        images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields, select colors/sizes, and upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    const finalFormData = {
      ...formData,
      discountPrice: formData.discountPrice || undefined,
    };

    createMutation.mutate({
      productData: finalFormData,
      imageFiles: images.map(img => img.file),
    });
  };

  const availableCategories = CATEGORIES[formData.productType as keyof typeof CATEGORIES] || [];
  const availableSizes = SIZES[formData.productType as keyof typeof SIZES] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product for your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Product Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type *</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value: 'CLOTHES' | 'SHOES') => setFormData(prev => ({ 
                      ...prev, 
                      productType: value,
                      category: '', // Reset category when type changes
                      availableSizes: [] // Reset sizes when type changes
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {type === 'CLOTHES' ? <Shirt className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                            {type}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="e.g., T-Shirts, Running Shoes"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your product..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Pricing & Stock</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colors & Sizes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Product Variants</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Available Colors *</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <Badge
                    key={color}
                    variant={formData.availableColors.includes(color) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2 transition-smooth"
                    onClick={() => handleColorToggle(color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Available Sizes *</Label>
              <div className="grid grid-cols-6 gap-2">
                {availableSizes.map((size) => (
                  <Badge
                    key={size}
                    variant={formData.availableSizes.includes(size) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2 transition-smooth"
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="w-5 h-5" />
              <span>Product Images ({images.length}/5)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                disabled={images.length >= 5}
              />
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {images.length >= 5 ? 'Maximum images reached' : 'Upload Product Images'}
              </h3>
              <p className="text-muted-foreground">
                {images.length >= 5 
                  ? 'Remove some images to add more'
                  : 'Drag and drop or click to select images (max 5)'}
              </p>
            </div>

            {isUploading && (
              <Progress value={50} className="w-full" />
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>{image.file.name}</p>
                      <p>{formatFileSize(image.file.size)}</p>
                      {image.dimensions && (
                        <p>{image.dimensions.width} × {image.dimensions.height}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link to="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="bg-gradient-primary hover:opacity-90"
            disabled={createMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}