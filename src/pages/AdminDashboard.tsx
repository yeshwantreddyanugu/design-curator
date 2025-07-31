import { useQuery } from '@tanstack/react-query';
import { designApi, DesignStats } from '@/services/designApi';
import { productApi, ProductStats } from '@/services/productApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Palette, 
  Crown, 
  TrendingUp, 
  Sparkles,
  Eye,
  Trash2,
  Clock,
  BarChart3,
  Package,
  Shirt,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  'hsl(217 91% 60%)', // primary
  'hsl(142 76% 36%)', // success
  'hsl(38 92% 50%)', // warning
  'hsl(0 72% 51%)', // destructive
  'hsl(142 76% 46%)', // accent variant
  'hsl(217 91% 70%)', // primary glow
];

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<DesignStats>({
    queryKey: ['design-stats'],
    queryFn: designApi.getStatistics,
  });

  const { data: productStats, isLoading: productLoading } = useQuery<ProductStats>({
    queryKey: ['product-stats'],
    queryFn: productApi.getStatistics,
  });

  if (isLoading || productLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your design collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const designChartData = Object.entries(stats?.categoryWiseCount || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const productChartData = Object.entries(productStats?.categoryWiseCount || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const metricCards = [
    {
      title: 'Total Designs',
      value: stats?.totalDesigns || 0,
      icon: Palette,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Premium Designs',
      value: stats?.premiumDesigns || 0,
      icon: Crown,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Trending',
      value: stats?.trendingDesigns || 0,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: 'New Arrivals',
      value: stats?.newArrivals || 0,
      icon: Sparkles,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: '+3%',
      changeType: 'positive' as const,
    },
  ];

  const productMetricCards = [
    {
      title: 'Total Products',
      value: productStats?.totalProducts || 0,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Clothes',
      value: productStats?.clothesProducts || 0,
      icon: Shirt,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: '+3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Shoes',
      value: productStats?.shoesProducts || 0,
      icon: ShoppingBag,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+7%',
      changeType: 'positive' as const,
    },
    {
      title: 'Low Stock',
      value: productStats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '-2%',
      changeType: 'negative' as const,
    },
  ];

  const additionalStats = [
    {
      title: 'Active Designs',
      value: stats?.activeDesigns || 0,
      icon: Eye,
      description: 'Currently visible to users',
    },
    {
      title: 'Deleted Designs',
      value: stats?.deletedDesigns || 0,
      icon: Trash2,
      description: 'Moved to trash',
    },
    {
      title: 'Recent Designs',
      value: stats?.recentDesigns || 0,
      icon: Clock,
      description: 'Created this month',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your design collection</p>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="overflow-hidden transition-smooth hover:shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and additional stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>Category Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={designChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {designChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {additionalStats.map((stat) => (
              <div key={stat.title} className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{stat.title}</p>
                    <span className="text-lg font-semibold text-foreground">{stat.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Product Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/products/create">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add New Product
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/create">
                <Palette className="w-4 h-4 mr-2" />
                Create New Design
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/products">
                <Package className="w-4 h-4 mr-2" />
                View All Products
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Items</span>
              <span className="font-semibold">{(stats?.totalDesigns || 0) + (productStats?.totalProducts || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low Stock Alert</span>
              <Badge variant={productStats?.lowStockProducts ? "destructive" : "secondary"}>
                {productStats?.lowStockProducts || 0} items
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Categories</span>
              <span className="font-semibold">
                {Object.keys({...stats?.categoryWiseCount, ...productStats?.categoryWiseCount}).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
            <p className="text-muted-foreground">Recent design uploads and updates will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}