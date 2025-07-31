import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/services/orderApi';
import { formatDistanceToNow } from 'date-fns';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'FAILED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order Details - {order.orderId}
            <Badge className={`${getStatusColor(order.status)} border`}>
              {order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                <p className="font-medium">{order.user.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p className="font-medium">{order.user.email}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-muted-foreground">Contact Details:</span>
                <p className="font-medium">{order.contactDetails}</p>
              </div>
            </div>
          </div>

          {/* Design Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Design Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Design Title:</span>
                <p className="font-medium">{order.design.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Unit Price:</span>
                <p className="font-medium">₹{order.design.price}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Quantity:</span>
                <p className="font-medium">{order.quantity}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                <p className="font-medium text-lg">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {(order.razorpayPaymentId || order.razorpayOrderId) && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
              <div className="grid grid-cols-1 gap-3">
                {order.razorpayPaymentId && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Payment ID:</span>
                    <p className="font-medium font-mono text-sm">{order.razorpayPaymentId}</p>
                  </div>
                )}
                {order.razorpayOrderId && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Razorpay Order ID:</span>
                    <p className="font-medium font-mono text-sm">{order.razorpayOrderId}</p>
                  </div>
                )}
                {order.razorpaySignature && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Signature:</span>
                    <p className="font-medium font-mono text-xs break-all">{order.razorpaySignature}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Timestamps */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Order Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};