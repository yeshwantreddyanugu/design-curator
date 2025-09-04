import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCustomRequests, 
  updateRequestStatus, 
  CustomDesignRequest,
  UpdateStatusRequest 
} from '@/services/customRequestApi';
import { CustomRequestDetailsModal } from '@/components/CustomRequestDetailsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  User, 
  Package, 
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

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

const getStatusCounts = (requests: CustomDesignRequest[]) => {
  return requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// StatusUpdateModal Component (embedded)
interface StatusUpdateModalProps {
  request: CustomDesignRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (requestId: number, status: string, adminNotes: string) => Promise<void>;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
];

function StatusUpdateModal({ request, isOpen, onClose, onUpdate }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset form when modal opens/closes or request changes
  useEffect(() => {
    if (request && isOpen) {
      setSelectedStatus(request.status);
      setAdminNotes(request.adminNotes || '');
    }
  }, [request, isOpen]);

  const handleSubmit = async () => {
    if (!request || !selectedStatus) return;

    try {
      setIsUpdating(true);
      await onUpdate(request.id, selectedStatus, adminNotes);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Update Request Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Request #{request.id}</span>
              <Badge className={getStatusColor(request.status)}>
                {request.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{request.designName}</p>
            <p className="text-xs text-muted-foreground">{request.user.name}</p>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        option.value === 'PENDING' ? 'bg-orange-500' :
                        option.value === 'IN_PROGRESS' ? 'bg-blue-500' :
                        option.value === 'COMPLETED' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes</label>
            <textarea
              placeholder="Add notes about this status update..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be visible to other administrators
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStatus || isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCustomRequests() {
  const [requests, setRequests] = useState<CustomDesignRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CustomDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomDesignRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const { toast } = useToast();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomRequests();
      console.log('API Response:', data); // Debug log
      
      // Ensure data is an array
      const requestsArray = Array.isArray(data) ? data : [];
      
      setRequests(requestsArray);
      setFilteredRequests(requestsArray);
    } catch (error) {
      console.error('Load requests error:', error);
      toast({
        title: "Error",
        description: "Failed to load custom design requests",
        variant: "destructive",
      });
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    let filtered = requests.filter(request => 
      request && 
      request.user && 
      request.user.name && 
      request.user.email &&
      request.designName &&
      request.category &&
      request.status
    );

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.designName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter]);

  const handleStatusUpdate = async (requestId: number, status: string, adminNotes: string) => {
    try {
      const updateData: UpdateStatusRequest = { status: status as any, adminNotes };
      const updatedRequest = await updateRequestStatus(requestId, updateData);
      
      setRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest : req
      ));
      
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleViewDetails = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleEditStatus = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setStatusModalOpen(true);
  };

  const statusCounts = getStatusCounts(requests);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custom Design Requests</h1>
        <p className="text-muted-foreground">
          Manage and track custom design requests from customers
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts.PENDING || 0}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.IN_PROGRESS || 0}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.COMPLETED || 0}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.REJECTED || 0}
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, email, or design..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Design Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                if (!request || !request.user) {
                  return null;
                }
                
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">#{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{request.user?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.designName || 'N/A'}</TableCell>
                    <TableCell>{request.category || 'N/A'}</TableCell>
                    <TableCell>{request.quantity || 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStatus(request)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid gap-4">
        {filteredRequests.map((request) => {
          if (!request || !request.user) {
            return null;
          }
          
          return (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">#{request.id}</CardTitle>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status?.replace('_', ' ') || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{request.user?.name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{request.user?.email || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{request.designName || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.category || 'N/A'} • Qty: {request.quantity || 0}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditStatus(request)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No custom requests found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Custom design requests will appear here when customers submit them.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CustomRequestDetailsModal
        request={selectedRequest}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      <StatusUpdateModal
        request={selectedRequest}
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}