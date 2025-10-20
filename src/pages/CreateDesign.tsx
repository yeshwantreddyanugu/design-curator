import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { designApi, CreateDesignRequest, getImageDimensions, formatFileSize } from '@/services/designApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Palette,
  DollarSign,
  IndianRupee,
  Tags,
  User,
  Save,
  ArrowLeft,
  Crown,
  TrendingUp,
  Sparkles,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ImageFile {
  file: File;
  preview: string;
  dimensions?: { width: number; height: number };
}

const CATEGORIES = [
  'Womenswear',
  'Menswear',
  'Giftware/Stationery',
  'Interiors/Home',
  'Kidswear',
  'Swimwear',
  'Activewear',
  'Archive'
];

const SUBCATEGORIES = [
  'Floral',
  'World',
  'Abstract',
  'Stripes',
  'Tropical',
  'Placements',
  'Camouflage',
  'Nature',
  '2 & 3 Colour',
  'Geometric',
  'Animals/Birds',
  'Conversationals',
  'Checks',
  'Paisleys',
  'Traditional',
  'Texture',
  'Animal Skins',
  'Border'
];

const LICENSE_TYPES = ['Personal', 'Commercial', 'Extended'];
const AVAILABLE_COLORS = [
  'Red', 'Blue', 'Black', 'White', 'Green', 
  'Yellow', 'Purple', 'Pink', 'Orange', 'Gray'
];

export default function CreateDesign() {
  const [formData, setFormData] = useState<CreateDesignRequest>({
    designName: '',
    category: '',
    subcategory: '',
    price: 0,
    discountPrice: 0,
    availableColors: [],
    tags: [],
    description: '',
    licenseType: 'Commercial',
    isPremium: false,
    isTrending: false,
    isNewArrival: false,
    designedBy: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customSubcategories, setCustomSubcategories] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Input states for custom additions
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ designData, imageFiles }: { designData: CreateDesignRequest; imageFiles: File[] }) =>
      designApi.createDesignWithImages(designData, imageFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });
      toast({
        title: "Design created successfully",
        description: "Your new design has been added to the collection.",
      });
      navigate('/admin/designs');
    },
    onError: (error) => {
      console.error('Design creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create design. Please try again.",
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

    setImages(prev => [...prev, ...newImages].slice(0, 6)); // Max 6 images
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

  // Enhanced category toggle to handle both predefined and custom categories
  const handleCategoryToggle = (category: string) => {
    console.log('Toggling category:', category);
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Update formData with comma-separated string
      setFormData(prevData => ({
        ...prevData,
        category: newCategories.join(', ')
      }));
      
      return newCategories;
    });
  };

  // Enhanced subcategory select to handle both predefined and custom subcategories
  const handleSubcategorySelect = (subcategory: string) => {
    console.log('Selecting subcategory:', subcategory);
    setFormData(prev => ({
      ...prev,
      subcategory: subcategory
    }));
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (newCategoryInput.trim() && !getAllCategories().includes(newCategoryInput.trim())) {
      const newCategory = newCategoryInput.trim();
      console.log('Adding custom category:', newCategory);
      setCustomCategories(prev => [...prev, newCategory]);
      handleCategoryToggle(newCategory);
      setNewCategoryInput('');
      toast({
        title: "Category Added",
        description: `"${newCategory}" has been added to categories.`,
      });
    } else if (getAllCategories().includes(newCategoryInput.trim())) {
      toast({
        title: "Category Exists",
        description: "This category already exists.",
        variant: "destructive",
      });
    }
  };

  // Add custom subcategory (replaces if one exists)
  const handleAddCustomSubcategory = () => {
    if (newSubcategoryInput.trim() && !getAllSubcategories().includes(newSubcategoryInput.trim())) {
      const newSubcategory = newSubcategoryInput.trim();
      console.log('Adding custom subcategory:', newSubcategory);
      setCustomSubcategories(prev => [...prev, newSubcategory]);
      handleSubcategorySelect(newSubcategory);
      setNewSubcategoryInput('');
      toast({
        title: "Subcategory Added",
        description: `"${newSubcategory}" has been added and selected.`,
      });
    } else if (getAllSubcategories().includes(newSubcategoryInput.trim())) {
      console.log('Subcategory exists, selecting it:', newSubcategoryInput.trim());
      handleSubcategorySelect(newSubcategoryInput.trim());
      setNewSubcategoryInput('');
      toast({
        title: "Subcategory Selected",
        description: `"${newSubcategoryInput.trim()}" has been selected.`,
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

  // Helper functions to get all categories, subcategories, and colors
  const getAllCategories = () => [...CATEGORIES, ...customCategories];
  const getAllSubcategories = () => [...SUBCATEGORIES, ...customSubcategories];
  const getAllColors = () => [...AVAILABLE_COLORS, ...customColors];

  // Remove custom category
  const removeCustomCategory = (category: string) => {
    console.log('Removing custom category:', category);
    setCustomCategories(prev => prev.filter(c => c !== category));
    setSelectedCategories(prev => prev.filter(c => c !== category));
    setFormData(prev => ({
      ...prev,
      category: prev.category.split(', ').filter(c => c !== category).join(', ')
    }));
  };

  // Remove custom subcategory
  const removeCustomSubcategory = (subcategory: string) => {
    console.log('Removing custom subcategory:', subcategory);
    setCustomSubcategories(prev => prev.filter(s => s !== subcategory));
    if (formData.subcategory === subcategory) {
      setFormData(prev => ({ ...prev, subcategory: '' }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current form data:', formData);
    console.log('Selected categories:', selectedCategories);
    console.log('Custom categories:', customCategories);
    console.log('Custom subcategories:', customSubcategories);
    console.log('Custom colors:', customColors);
    
    // Check only mandatory fields
    if (!formData.designName || !formData.category || !formData.subcategory || !formData.price || images.length === 0) {
      console.log('Validation failed - missing required fields');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Design Name, Category, Subcategory, Price, and upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
    const finalFormData = {
      ...formData,
      tags,
      discountPrice: formData.discountPrice || 0,
      designedBy: formData.designedBy || '',
      description: formData.description || '',
    };

    console.log('Final form data:', finalFormData);
    console.log('Image files:', images.map(img => img.file.name));

    createMutation.mutate({
      designData: finalFormData,
      imageFiles: images.map(img => img.file),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/admin/designs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Design</h1>
          <p className="text-muted-foreground">Add a new design to your collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designName">Design Name *</Label>
                  <Input
                    id="designName"
                    value={formData.designName}
                    onChange={(e) => setFormData(prev => ({ ...prev, designName: e.target.value }))}
                    placeholder="Enter design name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designedBy">Designer</Label>
                  <Input
                    id="designedBy"
                    value={formData.designedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, designedBy: e.target.value }))}
                    placeholder="Designer name"
                  />
                </div>
              </div>

              {/* Enhanced Categories Section */}
              <div className="space-y-4">
                <Label>Categories * (Select multiple)</Label>
                
                {/* Predefined Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2 text-xs"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Custom Categories */}
                {customCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Custom Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {customCategories.map((category) => (
                        <div key={category} className="relative group">
                          <Badge
                            variant={selectedCategories.includes(category) ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-xs w-full pr-6"
                            onClick={() => handleCategoryToggle(category)}
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
                    placeholder="Add custom category"
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

                {selectedCategories.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedCategories.join(', ')}
                  </p>
                )}
              </div>

              {/* Enhanced Subcategories Section */}
              <div className="space-y-4">
                <Label>Subcategory * (Select one)</Label>
                
                {/* Predefined Subcategories */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUBCATEGORIES.map((subcategory) => (
                    <Badge
                      key={subcategory}
                      variant={formData.subcategory === subcategory ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2 text-xs"
                      onClick={() => handleSubcategorySelect(subcategory)}
                    >
                      {subcategory}
                    </Badge>
                  ))}
                </div>

                {/* Custom Subcategories */}
                {customSubcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Custom Subcategories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {customSubcategories.map((subcategory) => (
                        <div key={subcategory} className="relative group">
                          <Badge
                            variant={formData.subcategory === subcategory ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-xs w-full pr-6"
                            onClick={() => handleSubcategorySelect(subcategory)}
                          >
                            {subcategory}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomSubcategory(subcategory);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Subcategory */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom subcategory"
                    value={newSubcategoryInput}
                    onChange={(e) => setNewSubcategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSubcategory())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomSubcategory}
                    disabled={!newSubcategoryInput.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.subcategory && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.subcategory}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your design..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5" />
                <span>Pricing & Options</span>
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
                  placeholder="0"
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
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseType">License Type</Label>
                <Select
                  value={formData.licenseType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, licenseType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((license) => (
                      <SelectItem key={license} value={license}>
                        {license}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Status Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPremium"
                      checked={formData.isPremium}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isPremium: !!checked }))
                      }
                    />
                    <Label htmlFor="isPremium" className="flex items-center space-x-2 cursor-pointer">
                      <Crown className="w-4 h-4 text-warning" />
                      <span>Premium</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isTrending"
                      checked={formData.isTrending}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isTrending: !!checked }))
                      }
                    />
                    <Label htmlFor="isTrending" className="flex items-center space-x-2 cursor-pointer">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span>Trending</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNewArrival"
                      checked={formData.isNewArrival}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isNewArrival: !!checked }))
                      }
                    />
                    <Label htmlFor="isNewArrival" className="flex items-center space-x-2 cursor-pointer">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>New Arrival</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags & Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tags className="w-5 h-5" />
              <span>Tags & Colors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="modern, trendy, abstract (comma separated)"
              />
              <p className="text-sm text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Enhanced Available Colors Section */}
            <div className="space-y-4">
              <Label>Available Colors (Select multiple)</Label>
              
              {/* Predefined Colors */}
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <Badge
                    key={color}
                    variant={formData.availableColors.includes(color) ? "default" : "outline"}
                    className="cursor-pointer justify-center py-2"
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
                  <div className="grid grid-cols-5 gap-2">
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
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="w-5 h-5" />
              <span>Images * ({images.length}/6)</span>
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
                disabled={images.length >= 6}
              />
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {images.length >= 6 ? 'Maximum images reached' : 'Upload Images *'}
              </h3>
              <p className="text-muted-foreground">
                {images.length >= 6 
                  ? 'Remove some images to add more'
                  : 'Drag and drop or click to select images (max 6)'}
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
          <Link to="/admin/designs">
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
            {createMutation.isPending ? 'Creating...' : 'Create Design'}
          </Button>
        </div>
      </form>
    </div>
  );
}