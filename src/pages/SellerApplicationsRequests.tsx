import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  User, 
  Building, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://az.lytortech.com';

// Types
interface SellerApplication {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName?: string;
  businessType: string;
  experienceYears: number;
  designCategories: string;
  portfolioUrl?: string;
  bio?: string;
  address?: string;
  city: string;
  state: string;
  pincode: string;
  termsAccepted: boolean;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminComments?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateStatusRequest {
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminComments?: string;
}

// API Functions
const fetchSellerApplications = async (page = 0, size = 20): Promise<SellerApplication[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller-applications?page=${page}&size=${size}`, {
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
    return data.content || data;
  } catch (error) {
    console.error('Error fetching seller applications:', error);
    throw error;
  }
};

const searchSellerApplications = async (query: string, page = 0, size = 20): Promise<SellerApplication[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller-applications/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
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
    return data.content || data;
  } catch (error) {
    console.error('Error searching seller applications:', error);
    throw error;
  }
};

const updateApplicationStatus = async (applicationId: number, updateData: UpdateStatusRequest): Promise<SellerApplication> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller-applications/${applicationId}/status`, {
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
        
    const data = await response.json();
    return data.application || data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

const deleteSellerApplication = async (applicationId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seller-applications/${applicationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting seller application:', error);
    throw error;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusCounts = (applications: SellerApplication[]) => {
  return applications.reduce((acc, application) => {
    acc[application.status] = (acc[application.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Application Details Modal Component
interface ApplicationDetailsModalProps {
  application: SellerApplication | null;
  isOpen: boolean;
  onClose: () => void;
}

function ApplicationDetailsModal({ application, isOpen, onClose }: ApplicationDetailsModalProps) {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Application Details - #{application.id}</span>
            <Badge className={getStatusColor(application.status)}>
              {application.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <a 
                    href={`mailto:${application.email}`}
                    className="text-primary hover:underline"
                  >
                    {application.email}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  <a 
                    href={`tel:${application.phoneNumber}`}
                    className="text-primary hover:underline"
                  >
                    {application.phoneNumber}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">{application.experienceYears} years</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{application.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="font-medium">{application.businessType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Design Categories</p>
                <p className="font-medium">{application.designCategories}</p>
              </div>
            </div>
            {application.portfolioUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Portfolio</p>
                <a 
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Portfolio
                </a>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{application.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{application.state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pincode</p>
                <p className="font-medium">{application.pincode}</p>
              </div>
            </div>
            {application.address && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{application.address}</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {application.bio && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Bio</h3>
              <div className="bg-background p-3 rounded border">
                <p className="text-sm whitespace-pre-wrap">{application.bio}</p>
              </div>
            </div>
          )}

          {/* Admin Comments */}
          {application.adminComments && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Admin Comments</h3>
              <div className="bg-background p-3 rounded border">
                <p className="text-sm whitespace-pre-wrap">{application.adminComments}</p>
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
                <span className="text-muted-foreground">Submitted:</span>
                <span>{new Date(application.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(application.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Status Update Modal Component
interface StatusUpdateModalProps {
  application: SellerApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (applicationId: number, status: string, adminComments: string) => Promise<void>;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function StatusUpdateModal({ application, isOpen, onClose, onUpdate }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [adminComments, setAdminComments] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (application && isOpen) {
      setSelectedStatus(application.status);
      setAdminComments(application.adminComments || '');
    }
  }, [application, isOpen]);

  const handleSubmit = async () => {
    if (!application || !selectedStatus) return;

    try {
      setIsUpdating(true);
      await onUpdate(application.id, selectedStatus, adminComments);
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

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Update Application Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Application Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Application #{application.id}</span>
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{application.fullName}</p>
            <p className="text-xs text-muted-foreground">{application.businessType}</p>
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
                        option.value === 'PENDING' ? 'bg-yellow-500' :
                        option.value === 'UNDER_REVIEW' ? 'bg-blue-500' :
                        option.value === 'APPROVED' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Comments */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Comments</label>
            <textarea
              placeholder="Add comments about this status update..."
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These comments will be visible to other administrators
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

export default function AdminSellerApplications() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<SellerApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchSellerApplications();
      console.log('API Response:', data);
      
      const applicationsArray = Array.isArray(data) ? data : [];
      
      setApplications(applicationsArray);
      setFilteredApplications(applicationsArray);
    } catch (error) {
      console.error('Load applications error:', error);
      toast({
        title: "Error",
        description: "Failed to load seller applications",
        variant: "destructive",
      });
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const searchApplications = async (query: string) => {
    try {
      setLoading(true);
      const data = await searchSellerApplications(query);
      const applicationsArray = Array.isArray(data) ? data : [];
      setFilteredApplications(applicationsArray);
    } catch (error) {
      console.error('Search applications error:', error);
      toast({
        title: "Error",
        description: "Failed to search applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      // Use API search when there's a search term
      const timeoutId = setTimeout(() => {
        searchApplications(searchTerm);
      }, 500); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      // Use local filtering when no search term
      let filtered = applications.filter(application => 
        application && 
        application.fullName && 
        application.email &&
        application.businessType &&
        application.status
      );

      // Filter by status
      if (statusFilter !== 'all') {
        filtered = filtered.filter(application => application.status === statusFilter);
      }

      setFilteredApplications(filtered);
    }
  }, [applications, searchTerm, statusFilter]);

  const handleStatusUpdate = async (applicationId: number, status: string, adminComments: string) => {
    try {
      const updateData: UpdateStatusRequest = { status: status as any, adminComments };
      const updatedApplication = await updateApplicationStatus(applicationId, updateData);
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? updatedApplication : app
      ));
      
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      setIsDeleting(true);
      await deleteSellerApplication(applicationToDelete.id);
      
      setApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
      setFilteredApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
      
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
      
      setDeleteModalOpen(false);
      setApplicationToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (application: SellerApplication) => {
    setSelectedApplication(application);
    setDetailsModalOpen(true);
  };

  const handleEditStatus = (application: SellerApplication) => {
    setSelectedApplication(application);
    setStatusModalOpen(true);
  };

  const handleDeleteClick = (application: SellerApplication) => {
    setApplicationToDelete(application);
    setDeleteModalOpen(true);
  };

  const statusCounts = getStatusCounts(applications);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Seller Applications</h1>
          <p className="text-muted-foreground">Manage and review seller applications from designers</p>
        </div>
        <Button onClick={() => loadApplications()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING || 0}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.UNDER_REVIEW || 0}</div>
            <p className="text-xs text-muted-foreground">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.APPROVED || 0}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.REJECTED || 0}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
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
                  placeholder="Search by name, email, business type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {applications.length === 0 ? 'No applications found' : 'No applications match your filters'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Business Type</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">#{application.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.fullName || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{application.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{application.businessType || 'N/A'}</TableCell>
                      <TableCell>{application.experienceYears || 0} years</TableCell>
                      <TableCell>{application.city || 'N/A'}, {application.state || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStatus(application)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(application)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        application={selectedApplication}
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onUpdate={handleStatusUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the seller application
              for {applicationToDelete?.fullName} (#{applicationToDelete?.id}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}