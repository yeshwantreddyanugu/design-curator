// API service for order management
const API_BASE_URL = 'https://az.lytortech.com';

export interface Order {
  id: number;
  orderId: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  design: {
    id: number;
    title: string;
    price: number;
  };
  name:string;
  email:string;
  phone:string;
  address:string;
  quantity: number;
  totalAmount: number;
  contactDetails: string;
  status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED" | "FAILED";
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELLED" | "FAILED";

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