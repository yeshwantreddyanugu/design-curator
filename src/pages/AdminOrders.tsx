import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { orderApiService, Order, OrderStatus } from '@/services/orderApi';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { Search, Eye, RefreshCw, Download, Package, ShoppingBag, MapPin, Phone, Mail, User, CreditCard, Truck, Calendar, FileText,Shield, Crown, TrendingUp, Sparkles, Tag, Hash } from 'lucide-react';

// Base URL Configuration
const BASE_URL = 'https://az.lytortech.com/api';

// Product Order Interface
interface ProductOrder {
  id: number;
  uid: string | null;
  product: {
    id: number;
    productName: string;
    productType: string;
    category: string;
    subcategory: string;
    price: number;
    discountPrice: number | null;
    availableColors: string[];
    availableSizes: string[];
    imageUrls: string[];
    description: string;
    stockQuantity: number;
    createdAt: string;
    updatedAt: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  unitPrice: number;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  orderId: string;
  paymentMethod: string;
  trackingNumber: string | null;
  orderNotes: string;
  orderDate: string;
  shippedDate: string | null;
  deliveredDate: string | null;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId: string | null;
  paymentId: string | null;
  razorpaySignature: string | null;
}

// Product Orders API Service
const productOrdersApi = {
  getAllProductOrders: async (): Promise<ProductOrder[]> => {
    const response = await fetch(`${BASE_URL}/orders/products/all`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch product orders');
    return response.json();
  },

  updateProductOrderStatus: async (orderId: number, newStatus: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/orders/products/${orderId}/status?status=${newStatus}`, {
      method: 'PUT',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    if (!response.ok) throw new Error('Failed to update product order status');
  },
};

// Design Order Details Modal
// Design Order Details Modal - FIXED VERSION
const DesignOrderDetailsModal: React.FC<{ 
  order: Order | null; 
  isOpen: boolean; 
  onClose: () => void 
}> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  // Get the first design from the designs array
  const design = order.designs && order.designs.length > 0 ? order.designs[0] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Design Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold text-xs break-all">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{format(new Date(order.createdAt), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{order.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{order.email || 'N/A'}</span>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
              )}
              {order.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <span>{order.address}</span>
                </div>
              )}
              {order.uid && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{order.uid}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Design Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {design ? (
                <div className="space-y-4">
                  {/* Design Image and Basic Info */}
                  <div className="flex gap-4">
                    {design.imageUrls && design.imageUrls.length > 0 && (
                      <div className="relative">
                        <img
                          src={design.imageUrls[0]}
                          alt={design.designName || 'Design'}
                          className="w-32 h-32 rounded-lg object-cover border-2 shadow-md"
                        />
                        {design.discountPrice && design.discountPrice < design.price && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 text-xs"
                          >
                            {Math.round(((design.price - design.discountPrice) / design.price) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-bold text-xl text-foreground">{design.designName || 'Unnamed Design'}</p>
                        <p className="text-sm text-muted-foreground">by {design.designedBy || 'Unknown'}</p>
                      </div>
                      
                      {/* Price Info */}
                      <div className="flex items-center gap-3">
                        {design.discountPrice && design.discountPrice < design.price ? (
                          <>
                            <span className="text-2xl font-bold text-green-600">₹{design.discountPrice.toFixed(2)}</span>
                            <span className="text-lg text-muted-foreground line-through">₹{design.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-foreground">₹{design.price.toFixed(2)}</span>
                        )}
                        <span className="text-muted-foreground">× {order.quantity}</span>
                      </div>

                      {/* Category Badges */}
                      <div className="flex flex-wrap gap-2">
                        {design.category && (
                          <Badge variant="secondary">{design.category}</Badge>
                        )}
                        {design.subcategory && (
                          <Badge variant="outline">{design.subcategory}</Badge>
                        )}
                        {design.licenseType && (
                          <Badge variant="outline" className="bg-blue-50">
                            <Shield className="w-3 h-3 mr-1" />
                            {design.licenseType}
                          </Badge>
                        )}
                        {design.isPremium && (
                          <Badge className="bg-amber-500">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {design.isTrending && (
                          <Badge className="bg-green-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        {design.isNewArrival && (
                          <Badge className="bg-purple-500">
                            <Sparkles className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {design.description && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Description</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{design.description}</p>
                    </div>
                  )}

                  {/* Technical Specifications */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t">
                    {design.fileSizePx && (
                      <div>
                        <p className="text-xs text-muted-foreground">File Size (px)</p>
                        <p className="font-medium text-sm">{design.fileSizePx}</p>
                      </div>
                    )}
                    {design.fileSizeCm && (
                      <div>
                        <p className="text-xs text-muted-foreground">File Size (cm)</p>
                        <p className="font-medium text-sm">{design.fileSizeCm}</p>
                      </div>
                    )}
                    {design.dpi && (
                      <div>
                        <p className="text-xs text-muted-foreground">DPI</p>
                        <p className="font-medium text-sm">{design.dpi}</p>
                      </div>
                    )}
                    {design.includedFiles && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-xs text-muted-foreground">Included Files</p>
                        <p className="font-medium text-sm">{design.includedFiles}</p>
                      </div>
                    )}
                  </div>

                  {/* Available Colors */}
                  {design.availableColors && design.availableColors.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Available Colors</p>
                      <div className="flex flex-wrap gap-2">
                        {design.availableColors.map((color, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {design.tags && design.tags.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {design.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No design information available</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info Card */}
          {(order.razorpayOrderId || order.razorpayPaymentId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.razorpayOrderId && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Razorpay Order ID</p>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{order.razorpayOrderId}</p>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment ID</p>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{order.razorpayPaymentId}</p>
                  </div>
                )}
                {order.razorpaySignature && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Signature</p>
                    <p className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">{order.razorpaySignature}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Created</span>
                <span className="text-sm font-medium">{format(new Date(order.createdAt), 'PPP p')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">{format(new Date(order.updatedAt), 'PPP p')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};



// Product Order Details Modal
const ProductOrderDetailsModal: React.FC<{ order: ProductOrder | null; isOpen: boolean; onClose: () => void }> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Product Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold">{order.orderId || `#${order.id}`}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Status</p>
                <Badge className={getStatusColor(order.orderStatus)}>{order.orderStatus}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge className={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{format(new Date(order.orderDate), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-green-600">₹{order.totalPrice}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{order.paymentMethod}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <span>{order.shippingAddress}</span>
              </div>
            </CardContent>
          </Card>

          {/* Product Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  {order.product.imageUrls && order.product.imageUrls.length > 0 && (
                    <div className="flex gap-2">
                      {order.product.imageUrls.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${order.product.productName} ${index + 1}`}
                          className="w-24 h-24 rounded-lg object-cover border"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{order.product.productName}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type: </span>
                      <span className="font-medium">{order.product.productType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <span className="font-medium">{order.product.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subcategory: </span>
                      <span className="font-medium">{order.product.subcategory}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit Price: </span>
                      <span className="font-medium">₹{order.unitPrice}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity: </span>
                      <span className="font-medium">{order.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold text-green-600">₹{order.totalPrice}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Selected Color: </span>
                      <Badge variant="outline">{order.selectedColor}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Selected Size: </span>
                      <Badge variant="outline">{order.selectedSize}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock: </span>
                      <span className="font-medium">{order.product.stockQuantity}</span>
                    </div>
                  </div>
                  {order.product.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Description:</p>
                      <p className="text-sm">{order.product.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-mono font-semibold">{order.trackingNumber}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {order.shippedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Shipped Date</p>
                    <p className="font-medium">{format(new Date(order.shippedDate), 'PPP')}</p>
                  </div>
                )}
                {order.deliveredDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Delivered Date</p>
                    <p className="font-medium">{format(new Date(order.deliveredDate), 'PPP')}</p>
                  </div>
                )}
              </div>
              {order.orderNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Order Notes</p>
                  <p className="text-sm">{order.orderNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info Card */}
          {(order.razorpayOrderId || order.paymentId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.razorpayOrderId && (
                  <div>
                    <span className="text-muted-foreground">Razorpay Order ID: </span>
                    <span className="font-mono">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.paymentId && (
                  <div>
                    <span className="text-muted-foreground">Payment ID: </span>
                    <span className="font-mono">{order.paymentId}</span>
                  </div>
                )}
                {order.razorpaySignature && (
                  <div>
                    <span className="text-muted-foreground">Signature: </span>
                    <span className="font-mono text-xs">{order.razorpaySignature}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
    case 'FAILED': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const AdminOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('designs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDesignOrder, setSelectedDesignOrder] = useState<Order | null>(null);
  const [selectedProductOrder, setSelectedProductOrder] = useState<ProductOrder | null>(null);
  const [isDesignDetailsModalOpen, setIsDesignDetailsModalOpen] = useState(false);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ orderId: number, newStatus: string, type: 'design' | 'product' } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Design Orders Query
  const { data: designOrders = [], isLoading: isLoadingDesigns, error: designError, refetch: refetchDesigns } = useQuery({
    queryKey: ['design-orders'],
    queryFn: () => orderApiService.getAllOrders(),
    refetchInterval: 30000,
  });

  // Product Orders Query
  const { data: productOrders = [], isLoading: isLoadingProducts, error: productError, refetch: refetchProducts } = useQuery({
    queryKey: ['product-orders'],
    queryFn: () => productOrdersApi.getAllProductOrders(),
    refetchInterval: 30000,
    enabled: activeTab === 'products', // Only fetch when tab is active
  });

  // Design Order Status Update Mutation
  const updateDesignStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: number; newStatus: OrderStatus }) =>
      orderApiService.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-orders'] });
      toast({
        title: "Success",
        description: "Design order status updated successfully",
      });
      setPendingStatusUpdate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update design order status",
        variant: "destructive",
      });
      console.error('Failed to update design order status:', error);
      setPendingStatusUpdate(null);
    },
  });

  // Product Order Status Update Mutation
  const updateProductStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: number; newStatus: string }) =>
      productOrdersApi.updateProductOrderStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-orders'] });
      toast({
        title: "Success",
        description: "Product order status updated successfully",
      });
      setPendingStatusUpdate(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product order status",
        variant: "destructive",
      });
      console.error('Failed to update product order status:', error);
      setPendingStatusUpdate(null);
    },
  });

  // Filtered Design Orders
  const filteredDesignOrders = useMemo(() => {
    return designOrders.filter(order => {
      const matchesSearch = searchTerm === '' ||
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.design?.designName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [designOrders, searchTerm, statusFilter]);

  // Filtered Product Orders
  const filteredProductOrders = useMemo(() => {
    return productOrders.filter(order => {
      const matchesSearch = searchTerm === '' ||
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.productName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [productOrders, searchTerm, statusFilter]);

  // Design Order Stats
  const designOrderStats = useMemo(() => {
    const stats = {
      total: designOrders.length,
      pending: 0,
      paid: 0,
      completed: 0,
      cancelled: 0,
      failed: 0,
      totalRevenue: 0,
    };

    designOrders.forEach(order => {
      stats[order.status.toLowerCase() as keyof typeof stats]++;
      if (order.status === 'PAID' || order.status === 'COMPLETED') {
        stats.totalRevenue += order.totalAmount;
      }
    });

    return stats;
  }, [designOrders]);

  // Product Order Stats
  const productOrderStats = useMemo(() => {
    const stats = {
      total: productOrders.length,
      pending: 0,
      paid: 0,
      completed: 0,
      cancelled: 0,
      failed: 0,
      totalRevenue: 0,
    };

    productOrders.forEach(order => {
      const status = order.orderStatus.toLowerCase();
      if (status in stats) {
        stats[status as keyof typeof stats]++;
      }
      if (order.paymentStatus === 'PAID' || order.orderStatus === 'COMPLETED') {
        stats.totalRevenue += order.totalPrice;
      }
    });

    return stats;
  }, [productOrders]);

  const handleStatusChange = (orderId: number, newStatus: string, type: 'design' | 'product') => {
    setPendingStatusUpdate({ orderId, newStatus, type });
  };

  const confirmStatusChange = () => {
    if (pendingStatusUpdate) {
      if (pendingStatusUpdate.type === 'design') {
        updateDesignStatusMutation.mutate({
          orderId: pendingStatusUpdate.orderId,
          newStatus: pendingStatusUpdate.newStatus as OrderStatus
        });
      } else {
        updateProductStatusMutation.mutate({
          orderId: pendingStatusUpdate.orderId,
          newStatus: pendingStatusUpdate.newStatus
        });
      }
    }
  };

  const viewDesignOrderDetails = (order: Order) => {
    setSelectedDesignOrder(order);
    setIsDesignDetailsModalOpen(true);
  };

  const viewProductOrderDetails = (order: ProductOrder) => {
    setSelectedProductOrder(order);
    setIsProductDetailsModalOpen(true);
  };

  const exportToCSV = () => {
    if (activeTab === 'designs') {
      const headers = ['Order ID', 'Customer', 'Email', 'Design', 'Quantity', 'Total Amount', 'Status', 'Created Date'];
      const csvContent = [
        headers.join(','),
        ...filteredDesignOrders.map(order => [
          order.orderId,
          order.name || 'N/A',
          order.email || 'N/A',
          order.design?.designName || 'N/A',
          order.quantity,
          order.totalAmount,
          order.status,
          new Date(order.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design-orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Product', 'Quantity', 'Total Price', 'Order Status', 'Payment Status', 'Order Date'];
      const csvContent = [
        headers.join(','),
        ...filteredProductOrders.map(order => [
          order.orderId || order.id,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.product.productName,
          order.quantity,
          order.totalPrice,
          order.orderStatus,
          order.paymentStatus,
          new Date(order.orderDate).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const currentStats = activeTab === 'designs' ? designOrderStats : productOrderStats;
  const isLoading = activeTab === 'designs' ? isLoadingDesigns : isLoadingProducts;
  const error = activeTab === 'designs' ? designError : productError;
  const refetch = activeTab === 'designs' ? refetchDesigns : refetchProducts;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading orders. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="designs" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Design Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product Orders
          </TabsTrigger>
        </TabsList>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{currentStats.total}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{currentStats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{currentStats.paid}</div>
              <p className="text-xs text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{currentStats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{currentStats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{currentStats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-green-600">₹{currentStats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === 'designs'
                      ? "Search by order ID, customer name, email, or design..."
                      : "Search by order ID, customer name, email, or product..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Design Orders Tab Content */}
        <TabsContent value="designs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Design Orders ({filteredDesignOrders.length})</CardTitle>
              <CardDescription>
                {filteredDesignOrders.length === designOrders.length
                  ? `Showing all ${designOrders.length} orders`
                  : `Showing ${filteredDesignOrders.length} of ${designOrders.length} orders`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading design orders...</div>
              ) : filteredDesignOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {designOrders.length === 0 ? 'No design orders found' : 'No design orders match your filters'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Design</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDesignOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{order.email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate" title={order.design?.designName || 'N/A'}>
                              {order.design?.designName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell className="font-medium">₹{order.totalAmount}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(newStatus: OrderStatus) => handleStatusChange(order.id, newStatus, 'design')}
                              disabled={updateDesignStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge className={`${getStatusColor(order.status)} border text-xs`}>
                                    {order.status}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDesignOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Orders Tab Content */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Orders ({filteredProductOrders.length})</CardTitle>
              <CardDescription>
                {filteredProductOrders.length === productOrders.length
                  ? `Showing all ${productOrders.length} orders`
                  : `Showing ${filteredProductOrders.length} of ${productOrders.length} orders`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading product orders...</div>
              ) : filteredProductOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {productOrders.length === 0 ? 'No product orders found' : 'No product orders match your filters'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Color/Size</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Order Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProductOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.orderId || `#${order.id}`}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.product.imageUrls?.[0] && (
                                <img
                                  src={order.product.imageUrls[0]}
                                  alt={order.product.productName}
                                  className="w-10 h-10 rounded object-cover border"
                                />
                              )}
                              <div className="max-w-32 truncate" title={order.product.productName}>
                                {order.product.productName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">{order.selectedColor}</Badge>
                              <Badge variant="outline" className="text-xs">{order.selectedSize}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell className="font-medium">₹{order.totalPrice}</TableCell>
                          <TableCell>
                            <Select
                              value={order.orderStatus}
                              onValueChange={(newStatus) => handleStatusChange(order.id, newStatus, 'product')}
                              disabled={updateProductStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge className={`${getStatusColor(order.orderStatus)} border text-xs`}>
                                    {order.orderStatus}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.paymentStatus)} border text-xs`}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewProductOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Order Details Modal */}
      <DesignOrderDetailsModal
        order={selectedDesignOrder}
        isOpen={isDesignDetailsModalOpen}
        onClose={() => setIsDesignDetailsModalOpen(false)}
      />

      {/* Product Order Details Modal */}
      <ProductOrderDetailsModal
        order={selectedProductOrder}
        isOpen={isProductDetailsModalOpen}
        onClose={() => setIsProductDetailsModalOpen(false)}
      />

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={!!pendingStatusUpdate} onOpenChange={() => setPendingStatusUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the order status to {pendingStatusUpdate?.newStatus}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {(updateDesignStatusMutation.isPending || updateProductStatusMutation.isPending) ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
