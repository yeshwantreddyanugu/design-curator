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
  Plus,
  Home,
  Sofa,
  Coffee,
  Gift,
  Baby
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ImageFile {
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}

const PRODUCT_TYPES = [
  'Furniture',
  'Furnishings',
  'Lifestyle',
  'Kitchen & Dining',
  'Decor Accessories',
  'Gifting',
  'Kids'
];

const AVAILABLE_COLORS = [
  'Red', 'Blue', 'Black', 'White', 'Green', 
  'Yellow', 'Purple', 'Pink', 'Orange', 'Gray',
  'Brown', 'Navy', 'Beige', 'Gold', 'Silver'
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Any Size'];

// Product type icons mapping
const PRODUCT_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  'Furniture': Sofa,
  'Furnishings': Home,
  'Lifestyle': Package,
  'Kitchen & Dining': Coffee,
  'Decor Accessories': Palette,
  'Gifting': Gift,
  'Kids': Baby
};

export default function CreateProduct() {
  const [formData, setFormData] = useState<CreateProductRequest>({
    productName: '',
    productType: '',
    category: '',
    subcategory: '',
    price: 0,
    discountPrice: 0,
    availableColors: [],
    availableSizes: [],
    description: '',
    stockQuantity: 0,
  });

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Input states for custom additions
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');
  const [newSizeInput, setNewSizeInput] = useState('');

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
      console.error('Product creation error:', error);
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

  // Enhanced color toggle to handle both predefined and custom colors
  const handleColorToggle = (color: string) => {
    console.log('Toggling color:', color);
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(color)
        ? prev.availableColors.filter(c => c !== color)
        : [...prev.availableColors, color],
    }));
  };

  // Enhanced size toggle to handle both predefined and custom sizes
  const handleSizeToggle = (size: string) => {
    console.log('Toggling size:', size);
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.includes(size)
        ? prev.availableSizes.filter(s => s !== size)
        : [...prev.availableSizes, size],
    }));
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (newCategoryInput.trim() && !customCategories.includes(newCategoryInput.trim())) {
      const newCategory = newCategoryInput.trim();
      console.log('Adding custom category:', newCategory);
      setCustomCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category: newCategory })); // Set as category since it's like subcategory
      setNewCategoryInput('');
      toast({
        title: "Category Added",
        description: `"${newCategory}" has been added and selected.`,
      });
    } else if (customCategories.includes(newCategoryInput.trim())) {
      console.log('Category exists, selecting it:', newCategoryInput.trim());
      setFormData(prev => ({ ...prev, category: newCategoryInput.trim() }));
      setNewCategoryInput('');
      toast({
        title: "Category Selected",
        description: `"${newCategoryInput.trim()}" has been selected.`,
      });
    }
  };

  // Add custom color
  const handleAddCustomColor = () => {
    if (newColorInput.trim() && !getAllColors().includes(newColorInput.trim())) {
      const newColor = newColorInput.trim();
      console.log('Adding custom color:', newColor);
      setCustomColors(prev => [...prev, newColor]);
      handleColorToggle(newColor);
      setNewColorInput('');
      toast({
        title: "Color Added",
        description: `"${newColor}" has been added to available colors.`,
      });
    } else if (getAllColors().includes(newColorInput.trim())) {
      toast({
        title: "Color Exists",
        description: "This color already exists.",
        variant: "destructive",
      });
    }
  };

  // Add custom size
  const handleAddCustomSize = () => {
    if (newSizeInput.trim() && !getAllSizes().includes(newSizeInput.trim())) {
      const newSize = newSizeInput.trim();
      console.log('Adding custom size:', newSize);
      setCustomSizes(prev => [...prev, newSize]);
      handleSizeToggle(newSize);
      setNewSizeInput('');
      toast({
        title: "Size Added",
        description: `"${newSize}" has been added to available sizes.`,
      });
    } else if (getAllSizes().includes(newSizeInput.trim())) {
      toast({
        title: "Size Exists",
        description: "This size already exists.",
        variant: "destructive",
      });
    }
  };

  // Helper functions to get all colors and sizes
  const getAllColors = () => [...AVAILABLE_COLORS, ...customColors];
  const getAllSizes = () => [...AVAILABLE_SIZES, ...customSizes];

  // Remove custom category
  const removeCustomCategory = (category: string) => {
    console.log('Removing custom category:', category);
    setCustomCategories(prev => prev.filter(c => c !== category));
    if (formData.category === category) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  // Remove custom color
  const removeCustomColor = (color: string) => {
    console.log('Removing custom color:', color);
    setCustomColors(prev => prev.filter(c => c !== color));
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.filter(c => c !== color)
    }));
  };

  // Remove custom size
  const removeCustomSize = (size: string) => {
    console.log('Removing custom size:', size);
    setCustomSizes(prev => prev.filter(s => s !== size));
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.filter(s => s !== size)
    }));
  };

  // Enhanced form validation with detailed error messages
  const validateForm = () => {
    const missingFields: string[] = [];
    
    if (!formData.productName.trim()) missingFields.push('Product Name');
    if (!formData.productType.trim()) missingFields.push('Product Type');
    if (!formData.category.trim()) missingFields.push('Category');
    if (!formData.subcategory.trim()) missingFields.push('Subcategory');
    if (!formData.price || formData.price <= 0) missingFields.push('Valid Price');
    if (!formData.stockQuantity || formData.stockQuantity < 0) missingFields.push('Stock Quantity');
    if (formData.availableColors.length === 0) missingFields.push('At least one Color');
    if (formData.availableSizes.length === 0) missingFields.push('At least one Size');
    if (images.length === 0) missingFields.push('At least one Product Image');

    return missingFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current form data:', formData);
    console.log('Custom categories:', customCategories);
    console.log('Custom colors:', customColors);
    console.log('Custom sizes:', customSizes);
    
    // Enhanced validation with specific field messages
    const missingFields = validateForm();
    
    if (missingFields.length > 0) {
      console.log('Validation failed - missing required fields:', missingFields);
      toast({
        title: "Missing Required Fields",
        description: `Please complete the following: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    const finalFormData = {
      ...formData,
      discountPrice: formData.discountPrice || undefined,
    };

    console.log('Final form data:', finalFormData);
    console.log('Image files:', images.map(img => img.file.name));

    createMutation.mutate({
      productData: finalFormData,
      imageFiles: images.map(img => img.file),
    });
  };

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
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      productType: value,
                      category: '', // Reset category when type changes
                      availableSizes: [] // Reset sizes when type changes
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => {
                        const IconComponent = PRODUCT_TYPE_ICONS[type] || Package;
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {type}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Category Section */}
              <div className="space-y-4">
                <Label>Category *</Label>
                
                {/* Custom Categories Display */}
                {customCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Available Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {customCategories.map((category) => (
                        <div key={category} className="relative group">
                          <Badge
                            variant={formData.category === category ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-xs w-full pr-6"
                            onClick={() => setFormData(prev => ({ ...prev, category: category }))}
                          >
                            {category}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomCategory(category);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Category */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add category (e.g., Bedroom Furniture, Kitchen Tools)"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCategory())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomCategory}
                    disabled={!newCategoryInput.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.category && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.category}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="e.g., Dining Chairs, Coffee Mugs, Wall Art"
                  required
                />
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
                  value={formData.price || ''}
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
                  value={formData.discountPrice || ''}
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
                  value={formData.stockQuantity || ''}
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
            {/* Enhanced Available Colors Section */}
            <div className="space-y-4">
              <Label>Available Colors * (Select multiple)</Label>
              
              {/* Predefined Colors */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <Badge
                    key={color}
                    variant={formData.availableColors.includes(color) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2 transition-all duration-200"
                    onClick={() => handleColorToggle(color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>

              {/* Custom Colors */}
              {customColors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Custom Colors</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {customColors.map((color) => (
                      <div key={color} className="relative group">
                        <Badge
                          variant={formData.availableColors.includes(color) ? "default" : "outline"}
                          className="cursor-pointer justify-center py-2 w-full pr-6"
                          onClick={() => handleColorToggle(color)}
                        >
                          {color}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomColor(color);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Color */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom color"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomColor())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomColor}
                  disabled={!newColorInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.availableColors.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.availableColors.join(', ')}
                </p>
              )}
            </div>

            {/* Enhanced Available Sizes Section */}
            <div className="space-y-4">
              <Label>Available Sizes * (Select multiple)</Label>
              
              {/* Predefined Sizes */}
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_SIZES.map((size) => (
                  <Badge
                    key={size}
                    variant={formData.availableSizes.includes(size) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2 transition-all duration-200"
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>

              {/* Custom Sizes */}
              {customSizes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Custom Sizes</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {customSizes.map((size) => (
                      <div key={size} className="relative group">
                        <Badge
                          variant={formData.availableSizes.includes(size) ? "default" : "outline"}
                          className="cursor-pointer justify-center py-2 w-full pr-6"
                          onClick={() => handleSizeToggle(size)}
                        >
                          {size}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomSize(size);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Size */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom size (e.g., 40cm, Large, One Size)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSize())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomSize}
                  disabled={!newSizeInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.availableSizes.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.availableSizes.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="w-5 h-5" />
              <span>Product Images * ({images.length}/5)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                images.length >= 5 
                  ? 'border-muted-foreground/30 cursor-not-allowed' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => images.length < 5 && document.getElementById('image-upload')?.click()}
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
                {images.length >= 5 ? 'Maximum images reached' : 'Upload Product Images *'}
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
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
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