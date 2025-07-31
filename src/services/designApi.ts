// API service for design management
const API_BASE_URL = 'https://b3ff65296f25.ngrok-free.app';

export interface Design {
  id: number;
  designName: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  imageUrls: string[];
  tags: string[];
  description: string;
  fileSizePx?: string;
  fileSizeCm?: string;
  dpi?: number;
  includedFiles?: string;
  licenseType: string;
  isPremium: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isDeleted?: boolean;
  designedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignStats {
  totalDesigns: number;
  premiumDesigns: number;
  trendingDesigns: number;
  newArrivals: number;
  activeDesigns: number;
  deletedDesigns: number;
  recentDesigns: number;
  categoryWiseCount: Record<string, number>;
}

export interface CreateDesignRequest {
  designName: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  tags: string[];
  description: string;
  licenseType: string;
  isPremium: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  designedBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Generic API call handler
async function apiCall<T>(endpoint: string, method = 'GET', data?: any): Promise<T> {
  const config: RequestInit = {
    method,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
    },
  };

  if (data instanceof FormData) {
    config.body = data;
  } else if (data) {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API call failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Design API functions
export const designApi = {
  // Get all designs with pagination
  getDesigns: (page = 0, size = 20): Promise<Design[]> =>
    apiCall(`/api/admin/designs?page=${page}&size=${size}`),

  // Get design statistics
  getStatistics: (): Promise<DesignStats> =>
    apiCall('/api/admin/designs/statistics'),

  // Get single design
  getDesign: (id: number): Promise<Design> =>
    apiCall(`/api/admin/designs/${id}`),

  // Create design with images
  createDesignWithImages: (designData: CreateDesignRequest, images: File[]): Promise<Design> => {
    const formData = new FormData();
    
    // Add images
    images.forEach(image => {
      formData.append('files', image);
    });
    
    // Add design data as JSON string
    formData.append('designData', JSON.stringify(designData));
    
    return apiCall('/api/admin/designs/create-with-images', 'POST', formData);
  },

  // Update design
  updateDesign: (id: number, data: Partial<CreateDesignRequest>): Promise<Design> =>
    apiCall(`/api/admin/designs/${id}`, 'PUT', data),

  // Update design with images
  updateDesignWithImages: (id: number, designData: Partial<CreateDesignRequest>, files: File[], replaceAllImages = false): Promise<Design> => {
    const formData = new FormData();
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    // Add design data
    formData.append('designData', JSON.stringify(designData));
    
    // Add replace flag
    formData.append('replaceAllImages', replaceAllImages.toString());
    
    return apiCall(`/api/admin/designs/${id}/update-with-images`, 'PUT', formData);
  },

  // Delete design
  deleteDesign: (id: number): Promise<string> =>
    apiCall(`/api/admin/designs/${id}`, 'DELETE'),

  // Bulk delete designs
  bulkDeleteDesigns: async (designIds: number[]): Promise<PromiseSettledResult<string>[]> => {
    const deletePromises = designIds.map(id => designApi.deleteDesign(id));
    return await Promise.allSettled(deletePromises);
  },
};

// Export utility functions
export const formatPrice = (price: number, discountPrice?: number) => {
  if (discountPrice && discountPrice < price) {
    return {
      original: `$${price.toFixed(2)}`,
      discount: `$${discountPrice.toFixed(2)}`,
      hasDiscount: true,
    };
  }
  return {
    original: `$${price.toFixed(2)}`,
    discount: null,
    hasDiscount: false,
  };
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = URL.createObjectURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};