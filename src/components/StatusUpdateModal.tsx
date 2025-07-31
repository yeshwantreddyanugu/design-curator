import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDesignRequest } from "@/services/customRequestApi";

interface StatusUpdateModalProps {
  request: CustomDesignRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (requestId: number, status: string, adminNotes: string) => Promise<void>;
}

const statusOptions = [
  { value: "PENDING", label: "Pending", color: "text-orange-600" },
  { value: "IN_PROGRESS", label: "In Progress", color: "text-blue-600" },
  { value: "COMPLETED", label: "Completed", color: "text-green-600" },
  { value: "REJECTED", label: "Rejected", color: "text-red-600" },
];

export function StatusUpdateModal({ request, isOpen, onClose, onUpdate }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = (open: boolean) => {
    if (open && request) {
      setSelectedStatus(request.status);
      setAdminNotes(request.adminNotes || "");
    } else {
      setSelectedStatus("");
      setAdminNotes("");
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!request || !selectedStatus) return;

    setIsLoading(true);
    try {
      await onUpdate(request.id, selectedStatus, adminNotes);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Request Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status-select">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add notes about this status update..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          {request.adminNotes && (
            <div>
              <Label>Previous Notes</Label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                <p className="whitespace-pre-wrap">{request.adminNotes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedStatus || isLoading}
          >
            {isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}