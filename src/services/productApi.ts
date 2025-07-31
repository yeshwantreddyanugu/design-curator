// API service for product management
const API_BASE_URL = 'https://b3ff65296f25.ngrok-free.app';

export interface Product {
  id: number;
  productName: string;
  productType: 'CLOTHES' | 'SHOES';
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  availableSizes: string[];
  imageUrls: string[];
  description: string;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  totalProducts: number;
  clothesProducts: number;
  shoesProducts: number;
  lowStockProducts: number;
  categoryWiseCount: Record<string, number>;
}

export interface CreateProductRequest {
  productName: string;
  productType: 'CLOTHES' | 'SHOES';
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  availableColors: string[];
  availableSizes: string[];
  description: string;
  stockQuantity: number;
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

// Product API functions
export const productApi = {
  // Get all products with pagination and filters
  getProducts: (page = 0, size = 20, filters = {}): Promise<Product[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...filters
    });
    return apiCall(`/api/admin/products?${params}`);
  },

  // Get product statistics
  getStatistics: (): Promise<ProductStats> =>
    apiCall('/api/admin/products/statistics'),

  // Get single product
  getProduct: (id: number): Promise<Product> =>
    apiCall(`/api/admin/products/${id}`),

  // Create product with images
  createProductWithImages: (productData: CreateProductRequest, images: File[]): Promise<Product> => {
    const formData = new FormData();
    
    // Add images
    images.forEach(image => {
      formData.append('files', image);
    });
    
    // Add product data as JSON string
    formData.append('productData', JSON.stringify(productData));
    
    return apiCall('/api/admin/products/create-with-images', 'POST', formData);
  },

  // Update product
  updateProduct: (id: number, data: Partial<CreateProductRequest>): Promise<Product> =>
    apiCall(`/api/admin/products/${id}`, 'PUT', data),

  // Update product with images
  updateProductWithImages: (id: number, productData: Partial<CreateProductRequest>, files: File[], replaceAllImages = false): Promise<Product> => {
    const formData = new FormData();
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    // Add product data
    formData.append('productData', JSON.stringify(productData));
    
    // Add replace flag
    formData.append('replaceAllImages', replaceAllImages.toString());
    
    return apiCall(`/api/admin/products/${id}/update-with-images`, 'PUT', formData);
  },

  // Delete product
  deleteProduct: (id: number): Promise<string> =>
    apiCall(`/api/admin/products/${id}`, 'DELETE'),

  // Bulk delete products
  bulkDeleteProducts: async (productIds: number[]): Promise<PromiseSettledResult<string>[]> => {
    const deletePromises = productIds.map(id => productApi.deleteProduct(id));
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

export const getStockStatus = (stockQuantity: number) => {
  if (stockQuantity === 0) {
    return { status: 'out', label: 'Out of Stock', className: 'bg-destructive/10 text-destructive' };
  } else if (stockQuantity < 10) {
    return { status: 'low', label: `Low Stock (${stockQuantity})`, className: 'bg-warning/10 text-warning' };
  } else {
    return { status: 'in', label: `In Stock (${stockQuantity})`, className: 'bg-success/10 text-success' };
  }
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