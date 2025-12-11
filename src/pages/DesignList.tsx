import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designApi, Design, formatPrice } from '@/services/designApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Crown,
  TrendingUp,
  Sparkles,
  Plus,
  Loader2,
  Save,
  IndianRupee,
  Palette,
  Tags,
  Calendar,
  User,
  Upload,
  X,
  AlertTriangle,
  Info,
  Percent,
  Link2,
  File,
  Maximize2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Womenswear',
  'Menswear',
  'Giftware/Stationery',
  'Interiors/Home',
  'Kidswear',
  'Swimwear',
  'Activewear',
  'Archive',
  'Graphics',
  'Backgrounds'
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
  'Border',
  'Backgrounds'
];

const LICENSE_TYPES = ['Personal', 'Commercial', 'Extended'];
const AVAILABLE_COLORS = [
  'Red', 'Blue', 'Black', 'White', 'Green',
  'Yellow', 'Purple', 'Pink', 'Orange', 'Gray'
];

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

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// View Design Modal Component
function ViewDesignModal({ design, open, onOpenChange }: { design: Design | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!design) return null;

  const pricing = formatPriceWithRupee(design.price, design.discountPrice);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>View Design - {design.designName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images */}
          {design.imageUrls && design.imageUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Images</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {design.imageUrls.map((url, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={url}
                      alt={`Design ${index + 1}`}
                      className="w-full h-full object-cover"
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
                <Palette className="w-4 h-4" />
                <span>Basic Information</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Design Name</Label>
                  <p className="text-foreground">{design.designName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-foreground">{design.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subcategory</Label>
                  <p className="text-foreground">{design.subcategory}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Designer</Label>
                  <p className="text-foreground">{design.designedBy || 'Not specified'}</p>
                </div>
                {design.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-foreground">{design.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing & Status */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <IndianRupee className="w-4 h-4" />
                <span>Pricing & Status</span>
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
                  <Label className="text-sm font-medium text-muted-foreground">License Type</Label>
                  <p className="text-foreground">{design.licenseType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {design.isPremium && (
                      <Badge variant="outline" className="text-warning border-warning">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {design.isTrending && (
                      <Badge variant="outline" className="text-success border-success">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {design.isNewArrival && (
                      <Badge variant="outline" className="text-accent border-accent">
                        <Sparkles className="w-3 h-3 mr-1" />
                        New Arrival
                      </Badge>
                    )}
                    {!design.isPremium && !design.isTrending && !design.isNewArrival && (
                      <Badge variant="outline">Regular</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Information - NEW SECTION */}
          {(design.fileSizePx || design.fileSizeCm || design.dpi || design.includedFiles || design.fileSizeBytes) && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <File className="w-4 h-4" />
                <span>File Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {design.fileSizePx && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      Dimensions (Pixels)
                    </Label>
                    <p className="text-foreground font-mono">{design.fileSizePx}</p>
                  </div>
                )}
                {design.fileSizeCm && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      Dimensions (cm)
                    </Label>
                    <p className="text-foreground font-mono">{design.fileSizeCm}</p>
                  </div>
                )}
                {design.dpi && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">DPI</Label>
                    <p className="text-foreground font-mono">{design.dpi}</p>
                  </div>
                )}
                {design.includedFiles && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Included Files</Label>
                    <p className="text-foreground">{design.includedFiles}</p>
                  </div>
                )}
                {design.fileSizeBytes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">File Size</Label>
                    <p className="text-foreground font-mono">{formatFileSize(design.fileSizeBytes)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags & Colors */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Tags className="w-4 h-4" />
              <span>Tags & Colors</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {design.tags && design.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {design.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {design.availableColors && design.availableColors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Available Colors</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {design.availableColors.map((color, index) => (
                      <Badge key={index} variant="secondary">{color}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Web Links */}
          {design.web_links && design.web_links.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center space-x-2">
                <Link2 className="w-4 h-4" />
                <span>Web Links</span>
              </h3>
              <div className="flex flex-col gap-2">
                {design.web_links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Link2 className="w-3 h-3" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                <p className="text-foreground">{new Date(design.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="text-foreground">{new Date(design.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit Design Modal Component
function EditDesignModal({ design, open, onOpenChange }: { design: Design | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = useState({
    designName: '',
    category: '',
    subcategory: '',
    price: 0,
    discountPrice: 0,
    availableColors: [] as string[],
    tags: [] as string[],
    web_links: [] as string[],
    description: '',
    licenseType: 'Commercial',
    isPremium: false,
    isTrending: false,
    isNewArrival: false,
    designedBy: '',
    // NEW FIELDS
    fileSizePx: '',
    fileSizeCm: '',
    dpi: 0,
    includedFiles: '',
    fileSizeBytes: 0,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [webLinksInput, setWebLinksInput] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate final price and discount amount based on percentage
  const calculatePricing = () => {
    if (formData.price > 0 && formData.discountPrice > 0 && formData.discountPrice < 100) {
      const discountAmount = (formData.price * formData.discountPrice) / 100;
      const finalPrice = formData.price - discountAmount;
      return {
        finalPrice,
        discountAmount,
        discountPercent: formData.discountPrice
      };
    }
    return {
      finalPrice: formData.price,
      discountAmount: 0,
      discountPercent: 0
    };
  };

  // Initialize form data when design changes
  React.useEffect(() => {
    if (design) {
      const categories = design.category ? design.category.split(',').map(c => c.trim()) : [];

      setFormData({
        designName: design.designName || '',
        category: design.category || '',
        subcategory: design.subcategory || '',
        price: design.price || 0,
        discountPrice: design.discountPrice || 0,
        availableColors: design.availableColors || [],
        tags: design.tags || [],
        web_links: design.web_links || [],
        description: design.description || '',
        licenseType: design.licenseType || 'Commercial',
        isPremium: design.isPremium || false,
        isTrending: design.isTrending || false,
        isNewArrival: design.isNewArrival || false,
        designedBy: design.designedBy || '',
        // NEW FIELDS
        fileSizePx: design.fileSizePx || '',
        fileSizeCm: design.fileSizeCm || '',
        dpi: design.dpi || 0,
        includedFiles: design.includedFiles || '',
        fileSizeBytes: design.fileSizeBytes || 0,
      });

      setSelectedCategories(categories);
      setTagsInput(design.tags ? design.tags.join(', ') : '');
      setWebLinksInput(design.web_links ? design.web_links.join(', ') : '');
      setExistingImages(design.imageUrls || []);
      setNewImages([]);
    }
  }, [design]);

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    const newImageFiles: { file: File; preview: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newImageFiles.push({ file, preview });
      }
    }

    const totalImages = existingImages.length + newImages.length + newImageFiles.length;
    if (totalImages > 6) {
      const allowedNew = 6 - existingImages.length - newImages.length;
      if (allowedNew > 0) {
        setNewImages(prev => [...prev, ...newImageFiles.slice(0, allowedNew)]);
        toast({
          title: "Image limit reached",
          description: `Only ${allowedNew} images were added. Maximum 6 images allowed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cannot add more images",
          description: "Maximum 6 images allowed. Remove some existing images first.",
          variant: "destructive",
        });
      }
    } else {
      setNewImages(prev => [...prev, ...newImageFiles]);
    }

    setIsUploading(false);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => {
      const newImagesCopy = [...prev];
      URL.revokeObjectURL(newImagesCopy[index].preview);
      newImagesCopy.splice(index, 1);
      return newImagesCopy;
    });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => designApi.updateDesign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });
      toast({
        title: "Design updated successfully",
        description: "Your design has been updated.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update design. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];

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

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      availableColors: prev.availableColors.includes(color)
        ? prev.availableColors.filter(c => c !== color)
        : [...prev.availableColors, color],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!design) return;

    if (!formData.designName || !formData.category || !formData.subcategory || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Design Name, Category, Subcategory, and Price.",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountPrice < 0 || formData.discountPrice >= 100) {
      toast({
        title: "Invalid Discount",
        description: "Discount percentage must be between 0 and 99.",
        variant: "destructive",
      });
      return;
    }

    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
    const web_links = webLinksInput.split(',').map(link => link.trim()).filter(Boolean);

    let availableColors = [];
    if (formData.availableColors) {
      if (Array.isArray(formData.availableColors)) {
        availableColors = formData.availableColors;
      } else if (typeof formData.availableColors === 'string') {
        availableColors = (formData.availableColors as string)
          .split(',')
          .map(color => color.trim())
          .filter(Boolean);
      }
    }

    const discountValue = Number(formData.discountPrice);
    const cleanDiscountPrice = (discountValue > 0 && discountValue < 100) ? discountValue : 0;

    const designData = {
      designName: formData.designName,
      category: formData.category,
      subcategory: formData.subcategory,
      price: Number(formData.price),
      discountPrice: cleanDiscountPrice,
      availableColors: availableColors,
      tags: tags,
      web_links: web_links,
      description: formData.description || '',
      licenseType: formData.licenseType || 'Commercial',
      isPremium: Boolean(formData.isPremium),
      isTrending: Boolean(formData.isTrending),
      isNewArrival: Boolean(formData.isNewArrival),
      designedBy: formData.designedBy || '',
      // NEW FIELDS
      fileSizePx: formData.fileSizePx || '',
      fileSizeCm: formData.fileSizeCm || '',
      dpi: Number(formData.dpi) || 0,
      includedFiles: formData.includedFiles || '',
      fileSizeBytes: Number(formData.fileSizeBytes) || 0,
    };

    const formDataToSend = new FormData();
    formDataToSend.append('designData', JSON.stringify(designData));

    if (newImages.length > 0) {
      newImages.forEach((image) => {
        formDataToSend.append('files', image.file);
      });
    }

    if (existingImages.length > 0) {
      formDataToSend.append('existingImages', JSON.stringify(existingImages));
    }

    try {
      await updateMutation.mutateAsync({
        id: design.id,
        data: formDataToSend,
      });
    } catch (error) {
      console.error('Edit submit error:', error);
    }
  };

  if (!design) return null;

  const pricing = calculatePricing();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Edit Design - {design.designName}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-designName">Design Name *</Label>
                  <Input
                    id="edit-designName"
                    value={formData.designName}
                    onChange={(e) => setFormData(prev => ({ ...prev, designName: e.target.value }))}
                    placeholder="Enter design name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categories * (Select multiple)</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="grid grid-cols-2 gap-2">
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
                  <Label htmlFor="edit-designedBy">Designer</Label>
                  <Input
                    id="edit-designedBy"
                    value={formData.designedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, designedBy: e.target.value }))}
                    placeholder="Designer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your design..."
                    rows={3}
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
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="2500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-discountPrice" className="flex items-center gap-2">
                    Discount Percentage (%)
                    <Percent className="w-4 h-4 text-muted-foreground" />
                  </Label>
                  <Input
                    id="edit-discountPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    max="99"
                    value={formData.discountPrice === 0 ? '' : formData.discountPrice}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '') {
                        setFormData(prev => ({ ...prev, discountPrice: 0 }));
                        return;
                      }
                      const numValue = parseFloat(inputValue);
                      if (isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, discountPrice: 0 }));
                        return;
                      }
                      const clampedValue = Math.min(Math.max(numValue, 0), 99);
                      setFormData(prev => ({ ...prev, discountPrice: clampedValue }));
                    }}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter discount as percentage (0-99%). Leave empty or enter 0 for no discount.
                  </p>
                </div>

                {/* Display Final Price Calculation */}
                {formData.price > 0 && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                    <Label className="text-sm font-medium">Final Price Preview</Label>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Original Price:</span>
                        <span className="font-medium">₹{formData.price.toFixed(2)}</span>
                      </div>
                      {pricing.discountPercent > 0 && (
                        <>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm text-muted-foreground">Discount ({pricing.discountPercent}%):</span>
                            <span className="font-medium text-destructive">-₹{pricing.discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 flex items-baseline justify-between">
                            <span className="text-sm font-semibold">Final Price:</span>
                            <span className="text-2xl font-bold text-success">₹{pricing.finalPrice.toFixed(2)}</span>
                          </div>
                          <Badge variant="secondary" className="w-full justify-center">
                            Save ₹{pricing.discountAmount.toFixed(2)} ({pricing.discountPercent}% OFF)
                          </Badge>
                        </>
                      )}
                      {pricing.discountPercent === 0 && (
                        <div className="border-t pt-2 flex items-baseline justify-between">
                          <span className="text-sm font-semibold">Final Price:</span>
                          <span className="text-2xl font-bold text-foreground">₹{pricing.finalPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-licenseType">License Type</Label>
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
                        id="edit-isPremium"
                        checked={formData.isPremium}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPremium: !!checked }))}
                      />
                      <Label htmlFor="edit-isPremium" className="flex items-center space-x-2 cursor-pointer">
                        <Crown className="w-4 h-4 text-warning" />
                        <span>Premium</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-isTrending"
                        checked={formData.isTrending}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTrending: !!checked }))}
                      />
                      <Label htmlFor="edit-isTrending" className="flex items-center space-x-2 cursor-pointer">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span>Trending</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-isNewArrival"
                        checked={formData.isNewArrival}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNewArrival: !!checked }))}
                      />
                      <Label htmlFor="edit-isNewArrival" className="flex items-center space-x-2 cursor-pointer">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span>New Arrival</span>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NEW SECTION: File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <File className="w-5 h-5" />
                <span>File Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fileSizePx" className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    Dimensions (Pixels)
                  </Label>
                  <Input
                    id="edit-fileSizePx"
                    value={formData.fileSizePx}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileSizePx: e.target.value }))}
                    placeholder="8000x3000"
                  />
                  <p className="text-xs text-muted-foreground">Format: WIDTHxHEIGHT (e.g., 8000x3000)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fileSizeCm" className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    Dimensions (cm)
                  </Label>
                  <Input
                    id="edit-fileSizeCm"
                    value={formData.fileSizeCm}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileSizeCm: e.target.value }))}
                    placeholder="801.6x127"
                  />
                  <p className="text-xs text-muted-foreground">Format: WIDTHxHEIGHT (e.g., 801.6x127)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dpi">DPI (Dots Per Inch)</Label>
                  <Input
                    id="edit-dpi"
                    type="number"
                    min="0"
                    value={formData.dpi || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dpi: parseInt(e.target.value) || 0 }))}
                    placeholder="300"
                  />
                  <p className="text-xs text-muted-foreground">Resolution (e.g., 300, 600, 800)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-includedFiles">Included File Types</Label>
                  <Input
                    id="edit-includedFiles"
                    value={formData.includedFiles}
                    onChange={(e) => setFormData(prev => ({ ...prev, includedFiles: e.target.value }))}
                    placeholder="PNG, JPG, PSD, AI, EPS"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated file types</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fileSizeBytes">File Size (Bytes)</Label>
                  <Input
                    id="edit-fileSizeBytes"
                    type="number"
                    min="0"
                    value={formData.fileSizeBytes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileSizeBytes: parseInt(e.target.value) || 0 }))}
                    placeholder="5242880"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.fileSizeBytes > 0 ? `≈ ${formatFileSize(formData.fileSizeBytes)}` : 'File size in bytes'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Images ({newImages.length}/6)</span>
              </CardTitle>
              {existingImages.length > 0 && newImages.length === 0 && (
                <div className="bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-md text-sm">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Warning: All current images will be removed. Adding at least one image is mandatory
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {newImages.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">New Images (Will Replace All Current Images)</Label>
                  <p className="text-sm text-muted-foreground">
                    These images will replace all existing images. Current images will be permanently removed.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newImages.map((image, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
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
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newImages.length < 6 && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('edit-image-upload')?.click()}
                >
                  <input
                    id="edit-image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium text-foreground mb-1">Add New Images</h3>
                  <p className="text-sm text-muted-foreground">
                    {6 - newImages.length} slots available
                  </p>
                  {existingImages.length > 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Current images will be replaced
                    </p>
                  )}
                </div>
              )}

              {existingImages.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Current Images: {existingImages.length}</p>
                      <p>All current images will be removed unless you add new ones.</p>
                    </div>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Uploading images...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags, Web Links & Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tags className="w-5 h-5" />
                <span>Tags, Web Links & Colors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="modern, trendy, abstract (comma separated)"
                />
                <p className="text-sm text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-webLinks" className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4" />
                  <span>Web Links</span>
                </Label>
                <Input
                  id="edit-webLinks"
                  value={webLinksInput}
                  onChange={(e) => setWebLinksInput(e.target.value)}
                  placeholder="https://example.com, https://portfolio.com (comma separated)"
                />
                <p className="text-sm text-muted-foreground">
                  Separate web links with commas
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? 'Updating...' : 'Update Design'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



export default function DesignList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [designToEdit, setDesignToEdit] = useState<Design | null>(null);
  const [designToView, setDesignToView] = useState<Design | null>(null);
  const [selectedDesigns, setSelectedDesigns] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: designs, isLoading, error } = useQuery<Design[]>({
    queryKey: ['designs'],
    queryFn: () => designApi.getDesigns(0, 50),
  });

  console.log('DesignList - Loaded designs:', designs);

  const deleteMutation = useMutation({
    mutationFn: designApi.deleteDesign,
    onSuccess: () => {
      console.log('DesignList - Delete successful');
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });
      toast({
        title: "Design deleted",
        description: "The design has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
    },
    onError: (error) => {
      console.error('DesignList - Delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete design. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: designApi.bulkDeleteDesigns,
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log('DesignList - Bulk delete results:', { successful, failed });

      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });

      if (failed === 0) {
        toast({
          title: "Designs deleted",
          description: `${successful} design(s) deleted successfully.`,
        });
      } else {
        toast({
          title: "Partial success",
          description: `${successful} deleted, ${failed} failed.`,
          variant: "destructive",
        });
      }

      setSelectedDesigns([]);
      setBulkDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('DesignList - Bulk delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete designs. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (design: Design) => {
    console.log('DesignList - Delete clicked for design:', design.id);
    setDesignToDelete(design);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (designToDelete) {
      console.log('DesignList - Confirming delete for design:', designToDelete.id);
      deleteMutation.mutate(designToDelete.id);
    }
  };

  const handleEditClick = (design: Design) => {
    console.log('DesignList - Edit clicked for design:', design.id);
    setDesignToEdit(design);
    setEditModalOpen(true);
  };

  const handleViewClick = (design: Design) => {
    console.log('DesignList - View clicked for design:', design.id);
    setDesignToView(design);
    setViewModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedDesigns.length > 0) {
      console.log('DesignList - Bulk delete clicked for designs:', selectedDesigns);
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedDesigns.length > 0) {
      console.log('DesignList - Confirming bulk delete for designs:', selectedDesigns);
      bulkDeleteMutation.mutate(selectedDesigns);
    }
  };

  const toggleDesignSelection = (designId: number) => {
    setSelectedDesigns(prev =>
      prev.includes(designId)
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedDesigns(prev =>
      prev.length === filteredDesigns.length
        ? []
        : filteredDesigns.map(d => d.id)
    );
  };

  const clearSelection = () => setSelectedDesigns([]);

  // Filter designs based on search and filters
  const filteredDesigns = designs?.filter((design) => {
    const matchesSearch = design.designName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || design.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'premium' && design.isPremium) ||
      (statusFilter === 'trending' && design.isTrending) ||
      (statusFilter === 'new' && design.isNewArrival);

    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const categories = [...new Set(designs?.map(d => d.category) || [])];

  console.log('DesignList - Filtered designs:', filteredDesigns.length, 'of', designs?.length);

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
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load designs</h3>
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
          <h1 className="text-3xl font-bold text-foreground">Design Library</h1>
          <p className="text-muted-foreground">
            {filteredDesigns.length} of {designs?.length || 0} designs
          </p>
        </div>
        <Link to="/admin/create">
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
            <Plus className="w-4 h-4 mr-2" />
            Create Design
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
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="new">New Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedDesigns.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedDesigns.length} design(s) selected
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
                    Delete Selected ({selectedDesigns.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Design Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Design Collection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedDesigns.length === filteredDesigns.length && filteredDesigns.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesigns.map((design) => {
                  const pricing = formatPriceWithRupee(design.price, design.discountPrice);
                  return (
                    <TableRow key={design.id} className="hover:bg-muted/50 transition-smooth">
                      <TableCell>
                        <Checkbox
                          checked={selectedDesigns.includes(design.id)}
                          onCheckedChange={() => toggleDesignSelection(design.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {design.imageUrls && design.imageUrls.length > 0 ? (
                            <img
                              src={design.imageUrls[0]}
                              alt={design.designName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Eye className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{design.designName}</p>
                          <p className="text-sm text-muted-foreground">{design.subcategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{design.category}</Badge>
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
                        <div className="flex flex-wrap gap-1">
                          {design.isPremium && (
                            <Badge variant="outline" className="text-warning border-warning">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {design.isTrending && (
                            <Badge variant="outline" className="text-success border-success">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          {design.isNewArrival && (
                            <Badge variant="outline" className="text-accent border-accent">
                              <Sparkles className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{design.designedBy}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClick(design)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(design)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Design
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(design)}
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

            {filteredDesigns.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No designs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first design to get started'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Design Modal */}
      <ViewDesignModal
        design={designToView}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />

      {/* Edit Design Modal */}
      <EditDesignModal
        design={designToEdit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{designToDelete?.designName}"? This action cannot be undone.
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
            <AlertDialogTitle>Delete Multiple Designs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDesigns.length} selected design(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedDesigns.length} Design(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
