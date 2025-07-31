import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Design, designApi, CreateDesignRequest } from '@/services/designApi';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

const editDesignSchema = z.object({
  designName: z.string().min(1, 'Design name is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().optional(),
  availableColors: z.string(),
  tags: z.string(),
  description: z.string().optional(),
  licenseType: z.enum(['Personal', 'Commercial']),
  isPremium: z.boolean(),
  isTrending: z.boolean(),
  isNewArrival: z.boolean(),
  designedBy: z.string().min(1, 'Designer name is required'),
});

type EditDesignForm = z.infer<typeof editDesignSchema>;

interface EditDesignModalProps {
  design: Design | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDesignModal({ design, open, onOpenChange }: EditDesignModalProps) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [replaceAllImages, setReplaceAllImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditDesignForm>({
    resolver: zodResolver(editDesignSchema),
    defaultValues: {
      designName: '',
      category: '',
      subcategory: '',
      price: 0,
      discountPrice: undefined,
      availableColors: '',
      tags: '',
      description: '',
      licenseType: 'Personal',
      isPremium: false,
      isTrending: false,
      isNewArrival: false,
      designedBy: '',
    },
  });

  // Reset form when design changes
  useEffect(() => {
    if (design) {
      form.reset({
        designName: design.designName,
        category: design.category,
        subcategory: design.subcategory || '',
        price: design.price,
        discountPrice: design.discountPrice,
        availableColors: design.availableColors.join(', '),
        tags: design.tags.join(', '),
        description: design.description || '',
        licenseType: design.licenseType as 'Personal' | 'Commercial',
        isPremium: design.isPremium,
        isTrending: design.isTrending,
        isNewArrival: design.isNewArrival,
        designedBy: design.designedBy,
      });
      setNewImages([]);
      setReplaceAllImages(false);
    }
  }, [design, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditDesignForm) => {
      if (!design) throw new Error('No design selected');

      const updateData: Partial<CreateDesignRequest> = {
        designName: data.designName,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price,
        discountPrice: data.discountPrice,
        availableColors: data.availableColors.split(',').map(c => c.trim()).filter(Boolean),
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        description: data.description,
        licenseType: data.licenseType,
        isPremium: data.isPremium,
        isTrending: data.isTrending,
        isNewArrival: data.isNewArrival,
        designedBy: data.designedBy,
      };

      if (newImages.length > 0) {
        return designApi.updateDesignWithImages(design.id, updateData, newImages, replaceAllImages);
      } else {
        return designApi.updateDesign(design.id, updateData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });
      toast({
        title: "Design updated",
        description: "The design has been successfully updated.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update design: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only JPEG, PNG, and WebP images are allowed.",
        variant: "destructive",
      });
    }

    setNewImages(prev => [...prev, ...validFiles]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
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

  const onSubmit = (data: EditDesignForm) => {
    updateMutation.mutate(data);
  };

  if (!design) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Design - {design.designName}</DialogTitle>
          <DialogDescription>
            Update design information and optionally replace images.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="designName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter design name" {...field} />
                      </FormControl>
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
                        <FormControl>
                          <Input placeholder="Category" {...field} />
                        </FormControl>
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
                          <Input placeholder="Subcategory" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        <FormLabel>Discount Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Optional"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="availableColors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Colors</FormLabel>
                      <FormControl>
                        <Input placeholder="Red, Blue, Green (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="modern, abstract, trendy (comma separated)" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Design description..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Settings and Images */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="licenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select license type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designed By</FormLabel>
                      <FormControl>
                        <Input placeholder="Designer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Checkboxes */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="isPremium"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Premium Design
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isTrending"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Trending Design
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isNewArrival"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          New Arrival
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Current Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {design.imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Design ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <span className="text-white text-xs">Image {index + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* New Images Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Update Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="replaceAll"
                        checked={replaceAllImages}
                        onCheckedChange={(checked) => setReplaceAllImages(checked === true)}
                      />
                      <label 
                        htmlFor="replaceAll" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Replace all existing images
                      </label>
                    </div>

                    {/* Drop Zone */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-primary/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop images here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPEG, PNG, WebP up to 10MB each
                        </p>
                      </label>
                    </div>

                    {/* New Images Preview */}
                    {newImages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">New Images ({newImages.length})</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {newImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Design
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