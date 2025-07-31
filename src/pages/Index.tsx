import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, ArrowRight, BarChart3, Plus } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // Auto redirect to admin dashboard after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8">
          <Palette className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-6">
          Design Admin Panel
        </h1>
        
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Manage your design collection with powerful tools for creating, organizing, and analyzing your designs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <BarChart3 className="w-8 h-8 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-white/80">Track performance and insights</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <Palette className="w-8 h-8 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Design Library</h3>
            <p className="text-sm text-white/80">Browse and manage all designs</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <Plus className="w-8 h-8 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Create New</h3>
            <p className="text-sm text-white/80">Upload and organize designs</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/admin')}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 transition-smooth"
          >
            Enter Admin Panel
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-white/70 text-sm">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
