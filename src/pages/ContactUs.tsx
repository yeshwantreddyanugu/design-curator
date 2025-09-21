import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  User, 
  MessageCircle, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Filter
} from "lucide-react";

export default function ContactPage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'recent', 'name'

  // Fetch all contacts
  const fetchContacts = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching contacts from /api/contact');
      const response = await fetch('/api/contact');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Contacts fetched successfully:', data);
        setContacts(data);
        setFilteredContacts(data);
      } else {
        const errorText = await response.text();
        console.error('Error fetching contacts:', errorText);
        setError('Failed to load contacts. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete contact by ID
  const deleteContact = async (id) => {
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      console.log(`Deleting contact with ID: ${id}`);
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const message = await response.text();
        console.log('Contact deleted successfully:', message);
        
        // Remove from local state
        setContacts(prev => prev.filter(contact => contact.id !== id));
        setFilteredContacts(prev => prev.filter(contact => contact.id !== id));
      } else {
        const errorText = await response.text();
        console.error('Error deleting contact:', errorText);
        setError(`Failed to delete contact: ${errorText}`);
      }
    } catch (error) {
      console.error('Network error during delete:', error);
      setError('Network error while deleting contact.');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Filter contacts based on search term and filter type
  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy === 'recent') {
      filtered = filtered.slice(0, 10); // Show only recent 10
    } else if (filterBy === 'name') {
      filtered = filtered.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, filterBy]);

  // Load contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Contact Management
            </h1>
            <p className="text-muted-foreground">
              Manage and review all contact form submissions
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="secondary" className="text-sm">
              Total: {contacts.length}
            </Badge>
            <Button onClick={fetchContacts} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search contacts by name, email, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterBy === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('recent')}
                >
                  Recent
                </Button>
                <Button
                  variant={filterBy === 'name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('name')}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  A-Z
                </Button>
              </div>
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredContacts.length} of {contacts.length} contacts
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact List */}
        {!isLoading && filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {contact.firstName} {contact.lastName}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          ID: {contact.id}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteContact(contact.id)}
                      disabled={deleteLoading[contact.id]}
                    >
                      {deleteLoading[contact.id] ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {contact.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {contact.phoneNumber}
                      </span>
                    </div>
                    {contact.createdAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">
                          {formatDate(contact.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="border-t pt-3">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm font-medium">Message:</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                      {contact.message.length > 150 
                        ? `${contact.message.substring(0, 150)}...` 
                        : contact.message}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => window.open(`tel:${contact.phoneNumber}`, '_blank')}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredContacts.length === 0 && contacts.length > 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Contacts State */}
        {!isLoading && contacts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">
                Contact form submissions will appear here when received
              </p>
              <Button onClick={fetchContacts}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {!isLoading && contacts.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{contacts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Contacts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{filteredContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Filtered Results</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {contacts.filter(c => c.createdAt && new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {new Set(contacts.map(c => c.email.split('@')[1])).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Unique Domains</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}