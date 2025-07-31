import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Mail, Phone, Package } from "lucide-react";
import { CustomDesignRequest } from "@/services/customRequestApi";

interface CustomRequestDetailsModalProps {
  request: CustomDesignRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function CustomRequestDetailsModal({ request, isOpen, onClose }: CustomRequestDetailsModalProps) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Request Details - #{request.id}</span>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{request.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <a 
                    href={`mailto:${request.user.email}`}
                    className="text-primary hover:underline"
                  >
                    {request.user.email}
                  </a>
                </div>
              </div>
              {request.user.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    <a 
                      href={`tel:${request.user.phone}`}
                      className="text-primary hover:underline"
                    >
                      {request.user.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Design Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Design Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Design Name</p>
                <p className="font-medium">{request.designName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{request.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{request.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subcategory</p>
                <p className="font-medium">{request.subcategory}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Details</p>
              <div className="bg-background p-3 rounded border">
                <p className="text-sm whitespace-pre-wrap">{request.details}</p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {request.adminNotes && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Admin Notes</h3>
              <div className="bg-background p-3 rounded border">
                <p className="text-sm whitespace-pre-wrap">{request.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(request.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(request.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}