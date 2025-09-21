import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Eye
} from "lucide-react";

export default function BannerImageUploadPage() {
  const [formData, setFormData] = useState({
    text: '',
    discountText: '',
    image: null
  });
  const [currentBanner, setCurrentBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Form field ${name} updated:`, value);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      console.log('Banner Management: File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
    }
  };

  // Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    // Clear the file input
    const fileInput = document.getElementById('banner-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    console.log('Banner Management: File selection cleared');
  };

  // Create or Update Banner (POST)
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim() || !formData.discountText.trim() || !formData.image) {
      setStatus('error');
      setMessage('Please fill all fields and select an image');
      return;
    }

    setIsUploading(true);
    setStatus(null);
    setMessage('');

    // Create FormData object
    const uploadFormData = new FormData();
    uploadFormData.append('text', formData.text.trim());
    uploadFormData.append('discountText', formData.discountText.trim());
    uploadFormData.append('image', formData.image);

    console.log('Banner Management: Uploading banner with data:');
    console.log('  - text:', formData.text);
    console.log('  - discountText:', formData.discountText);
    console.log('  - image file:', {
      name: formData.image.name,
      size: formData.image.size,
      type: formData.image.type
    });

    // Log FormData contents (for debugging)
    console.log('Banner Management: FormData entries:');
    for (let pair of uploadFormData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  - ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`);
      } else {
        console.log(`  - ${pair[0]}: ${pair[1]}`);
      }
    }

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        body: uploadFormData // Don't set Content-Type header, browser will set it with boundary
      });

      console.log('Banner Management: Upload response status:', response.status);
      const responseData = await response.json();
      console.log('Banner Management: Upload response data:', responseData);

      if (response.ok && responseData.success) {
        setStatus('success');
        setMessage(responseData.message || 'Banner uploaded successfully');
        setCurrentBanner(responseData.data);
        
        // Clear form
        setFormData({
          text: '',
          discountText: '',
          image: null
        });
        clearFileSelection();
      } else {
        setStatus('error');
        setMessage(responseData.message || 'Failed to upload banner');
      }
    } catch (error) {
      console.error('Banner Management: Upload error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Banner (DELETE)
  const handleDelete = async () => {
    if (!currentBanner) {
      setStatus('error');
      setMessage('No banner to delete');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete the current banner?');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setStatus(null);
    setMessage('');

    console.log('Banner Management: Deleting banner with ID:', currentBanner.id);

    try {
      const response = await fetch('/api/banners', {
        method: 'DELETE'
      });

      console.log('Banner Management: Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Banner Management: Delete response data:', responseData);

      if (response.ok && responseData.success) {
        setStatus('success');
        setMessage(responseData.message || 'Banner deleted successfully');
        setCurrentBanner(null);
      } else {
        setStatus('error');
        setMessage(responseData.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Banner Management: Delete error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isFormValid = () => {
    return formData.text.trim() && formData.discountText.trim() && formData.image;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Banner Management
          </h1>
          <p className="text-muted-foreground">
            Create, update, and delete banner images with custom text and discount information
          </p>
        </div>

        {/* Status Alerts */}
        {status === 'success' && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Current Banner Display */}
        {currentBanner && (
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Current Banner
                </CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Banner
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Banner Text</Label>
                    <p className="text-lg font-semibold">{currentBanner.text}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Discount Text</Label>
                    <p className="text-lg font-semibold text-primary">{currentBanner.discountText}</p>
                  </div>
                </div>
                {currentBanner.bannerImage && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Banner Image</Label>
                    <img
                      src={currentBanner.bannerImage}
                      alt="Current Banner"
                      className="w-full max-w-md h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {currentBanner ? 'Update Banner' : 'Create New Banner'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-sm font-medium">
                    Banner Text *
                  </Label>
                  <Input
                    id="text"
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="e.g., Big Sale"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountText" className="text-sm font-medium">
                    Discount Text *
                  </Label>
                  <Input
                    id="discountText"
                    name="discountText"
                    value={formData.discountText}
                    onChange={handleInputChange}
                    placeholder="e.g., 50% OFF"
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner-file-input" className="text-sm font-medium">
                  Banner Image *
                </Label>
                <div className="space-y-3">
                  <Input
                    id="banner-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!currentBanner} // Only required for new banners
                    className="h-11"
                  />
                  
                  {/* File Selection Display */}
                  {selectedFile && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFileSelection}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Preview</Label>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isUploading || !isFormValid()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {currentBanner ? 'Updating Banner...' : 'Creating Banner...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {currentBanner ? 'Update Banner' : 'Create Banner'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Image Requirements</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                  <li>• Recommended size: 1200x400 pixels</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• High resolution images preferred</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Text Guidelines</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Keep banner text concise and impactful</li>
                  <li>• Use clear discount percentages or amounts</li>
                  <li>• Consider mobile display when writing text</li>
                  <li>• Test readability on different backgrounds</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}