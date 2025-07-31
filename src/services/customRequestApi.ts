const API_BASE_URL = 'https://b3ff65296f25.ngrok-free.app';

export interface CustomDesignRequest {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  designName: string;
  category: string;
  subcategory: string;
  quantity: number;
  details: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStatusRequest {
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  adminNotes?: string;
}

export const fetchCustomRequests = async (page = 0, size = 20): Promise<CustomDesignRequest[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/custom-requests?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Convert Page object to simple array if needed
    return data.content || data;
  } catch (error) {
    console.error('Error fetching custom requests:', error);
    throw error;
  }
};

export const updateRequestStatus = async (requestId: number, updateData: UpdateStatusRequest): Promise<CustomDesignRequest> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/custom-requests/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};