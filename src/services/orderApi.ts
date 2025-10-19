// API service for order management
const API_BASE_URL = 'https://az.lytortech.com';

// Add to your orderApi.ts or types file
export interface Order {
  id: number;
  orderId: string;
  uid?: string; // User ID
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  designs?: Design[]; // Array of designs (not single design)
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  razorpayPaymentId?: string; // Changed from paymentId
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
  //design?: number; // Design ID reference (keeping backward compatibility)
}

// Separate Design interface for better type safety
export interface Design {
  id: number;
  designName?: string;
  category?: string;
  subcategory?: string;
  price: number;
  discountPrice?: number | null;
  availableColors?: string[];
  imageUrls?: string[];
  tags?: string[];
  description?: string;
  fileSizePx?: string; // e.g., "3072x4096"
  fileSizeCm?: string; // e.g., "108.37x144.50"
  dpi?: number;
  includedFiles?: string;
  licenseType?: string;
  isPremium?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isDeleted?: boolean;
  designedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';



export type OrderStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELLED" | "FAILED" | "REFUNDED" |"PROCESSING";

class OrderApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllOrders(page = 0, size = 20): Promise<Order[]> {
    try {
      const data = await this.makeRequest(`/api/admin/orders?page=${page}&size=${size}`);
      // Handle both Page object and direct array responses
      return data.content || data.data || data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
    try {
      const data = await this.makeRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      return data.data || data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const data = await this.makeRequest(`/api/admin/orders/${orderId}`);
      return data.data || data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
}

export const orderApiService = new OrderApiService();