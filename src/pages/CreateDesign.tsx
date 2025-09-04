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
  Tags,
  User,
  Save,
  ArrowLeft,
  Crown,
  TrendingUp,
  Sparkles
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
  const [images, setImages] = useState<ImageFile[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(color)
        ? prev.availableColors.filter(c => c !== color)
        : [...prev.availableColors, color],
    }));
  };

  const handleCategoryToggle = (category: string) => {
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

  const handleSubcategorySelect = (subcategory: string) => {
    setFormData(prev => ({
      ...prev,
      subcategory: subcategory
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check only mandatory fields
    if (!formData.designName || !formData.category || !formData.subcategory || !formData.price || images.length === 0) {
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

              <div className="space-y-2">
                <Label>Categories * (Select multiple)</Label>
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
                {selectedCategories.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedCategories.join(', ')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Subcategory * (Select one)</Label>
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
                <DollarSign className="w-5 h-5" />
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
                  placeholder="100"
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
                  placeholder="10"
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

            <div className="space-y-3">
              <Label>Available Colors</Label>
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