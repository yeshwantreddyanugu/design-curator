import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designApi, Design, formatPrice } from '@/services/designApi';
import EditDesignModal from '@/components/EditDesignModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Crown,
  TrendingUp,
  Sparkles,
  Plus,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DesignList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [designToEdit, setDesignToEdit] = useState<Design | null>(null);
  const [selectedDesigns, setSelectedDesigns] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: designs, isLoading, error } = useQuery<Design[]>({
    queryKey: ['designs'],
    queryFn: () => designApi.getDesigns(0, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: designApi.deleteDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });
      toast({
        title: "Design deleted",
        description: "The design has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete design. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: designApi.bulkDeleteDesigns,
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({ queryKey: ['design-stats'] });
      
      if (failed === 0) {
        toast({
          title: "Designs deleted",
          description: `${successful} design(s) deleted successfully.`,
        });
      } else {
        toast({
          title: "Partial success",
          description: `${successful} deleted, ${failed} failed.`,
          variant: "destructive",
        });
      }
      
      setSelectedDesigns([]);
      setBulkDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete designs. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (design: Design) => {
    setDesignToDelete(design);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (designToDelete) {
      deleteMutation.mutate(designToDelete.id);
    }
  };

  const handleEditClick = (design: Design) => {
    setDesignToEdit(design);
    setEditModalOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedDesigns.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedDesigns.length > 0) {
      bulkDeleteMutation.mutate(selectedDesigns);
    }
  };

  const toggleDesignSelection = (designId: number) => {
    setSelectedDesigns(prev => 
      prev.includes(designId)
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedDesigns(prev => 
      prev.length === filteredDesigns.length 
        ? [] 
        : filteredDesigns.map(d => d.id)
    );
  };

  const clearSelection = () => setSelectedDesigns([]);

  // Filter designs based on search and filters
  const filteredDesigns = designs?.filter((design) => {
    const matchesSearch = design.designName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || design.category === categoryFilter;
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'premium' && design.isPremium) ||
      (statusFilter === 'trending' && design.isTrending) ||
      (statusFilter === 'new' && design.isNewArrival);

    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const categories = [...new Set(designs?.map(d => d.category) || [])];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load designs</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Design Library</h1>
          <p className="text-muted-foreground">
            {filteredDesigns.length} of {designs?.length || 0} designs
          </p>
        </div>
        <Link to="/admin/create">
          <Button className="bg-gradient-primary hover:opacity-90 transition-smooth">
            <Plus className="w-4 h-4 mr-2" />
            Create Design
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="new">New Arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedDesigns.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedDesigns.length} design(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedDesigns.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Design Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Design Collection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedDesigns.length === filteredDesigns.length && filteredDesigns.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesigns.map((design) => {
                  const pricing = formatPrice(design.price, design.discountPrice);
                  return (
                    <TableRow key={design.id} className="hover:bg-muted/50 transition-smooth">
                      <TableCell>
                        <Checkbox
                          checked={selectedDesigns.includes(design.id)}
                          onCheckedChange={() => toggleDesignSelection(design.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {design.imageUrls.length > 0 ? (
                            <img
                              src={design.imageUrls[0]}
                              alt={design.designName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Eye className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{design.designName}</p>
                          <p className="text-sm text-muted-foreground">{design.subcategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{design.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {pricing.hasDiscount ? (
                            <>
                              <p className="font-semibold text-success">{pricing.discount}</p>
                              <p className="text-sm text-muted-foreground line-through">
                                {pricing.original}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground">{pricing.original}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {design.isPremium && (
                            <Badge variant="outline" className="text-warning border-warning">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {design.isTrending && (
                            <Badge variant="outline" className="text-success border-success">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          {design.isNewArrival && (
                            <Badge variant="outline" className="text-accent border-accent">
                              <Sparkles className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{design.designedBy}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(design)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Design
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(design)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredDesigns.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No designs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first design to get started'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Design Modal */}
      <EditDesignModal
        design={designToEdit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{designToDelete?.designName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Designs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDesigns.length} selected design(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedDesigns.length} Design(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}