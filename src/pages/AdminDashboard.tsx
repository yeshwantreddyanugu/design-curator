import { useQuery } from '@tanstack/react-query';
import { designApi, DesignStats } from '@/services/designApi';
import { productApi, ProductStats } from '@/services/productApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Zap,
  Target,
  Award,
  Star,
  Filter,
  ClipboardList
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

const CHART_COLORS = {
  primary: 'hsl(217 91% 60%)',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(38 92% 50%)',
  accent: 'hsl(142 76% 46%)',
  muted: 'hsl(215 16% 47%)',
};

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
      <div className="space-y-8 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
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
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
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

  // Mock trend data for charts
  const trendData = [
    { month: 'Jan', designs: 12, products: 8 },
    { month: 'Feb', designs: 15, products: 10 },
    { month: 'Mar', designs: 18, products: 12 },
    { month: 'Apr', designs: 22, products: 15 },
    { month: 'May', designs: 19, products: 14 },
    { month: 'Jun', designs: 24, products: 17 },
  ];

  const metricCards = [
    {
      title: 'Total Designs',
      value: stats?.totalDesigns || 0,
      icon: Palette,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      change: '+12%',
      changeType: 'positive' as const,
      trend: [65, 59, 80, 81, 56, 55, 40],
    },
    {
      title: 'Premium Designs',
      value: stats?.premiumDesigns || 0,
      icon: Crown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      change: '+8%',
      changeType: 'positive' as const,
      trend: [45, 52, 38, 45, 56, 48, 55],
    },
    {
      title: 'Trending',
      value: stats?.trendingDesigns || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      change: '+15%',
      changeType: 'positive' as const,
      trend: [28, 48, 40, 58, 62, 55, 68],
    },
    {
      title: 'New Arrivals',
      value: stats?.newArrivals || 0,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      change: '+3%',
      changeType: 'positive' as const,
      trend: [12, 18, 15, 22, 19, 17, 20],
    },
  ];

  const additionalStats = [
    {
      title: 'Active Designs',
      value: stats?.activeDesigns || 0,
      icon: Eye,
      color: 'text-blue-600',
      description: 'Currently visible to users',
      percentage: stats?.totalDesigns ? ((stats?.activeDesigns || 0) / stats.totalDesigns * 100) : 0,
    },
    {
      title: 'Deleted Designs',
      value: stats?.deletedDesigns || 0,
      icon: Trash2,
      color: 'text-red-600',
      description: 'Moved to trash',
      percentage: stats?.totalDesigns ? ((stats?.deletedDesigns || 0) / stats.totalDesigns * 100) : 0,
    },
    {
      title: 'Recent Designs',
      value: stats?.recentDesigns || 0,
      icon: Clock,
      color: 'text-green-600',
      description: 'Created this month',
      percentage: stats?.totalDesigns ? ((stats?.recentDesigns || 0) / stats.totalDesigns * 100) : 0,
    },
  ];

  const quickActions = [
    { label: 'View Designs', icon: Eye, link: '/admin/designs', color: 'bg-green-500 hover:bg-green-600' },
    { label: 'View Products', icon: Package, link: '/admin/products', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Orders', icon: ShoppingBag, link: '/admin/orders', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Seller Application Requests', icon: ClipboardList, link: '/admin/sellerApplicationRequests', color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Link to="/admin/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
              <Palette className="w-4 h-4 mr-2" />
              Create New Design
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card 
            key={metric.title} 
            className={`overflow-hidden border-l-4 ${metric.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${metric.bgColor} shadow-sm`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {metric.changeType === 'positive' ? (
                      <div className="flex items-center text-green-600 text-sm font-semibold">
                        <ArrowUpRight className="w-4 h-4" />
                        {metric.change}
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 text-sm font-semibold">
                        <ArrowDownRight className="w-4 h-4" />
                        {metric.change}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                {/* Mini trend line */}
                <div className="h-12 -mb-2 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.trend.map((v, i) => ({ value: v }))}>
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[index]} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS[index]} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={COLORS[index]} 
                        strokeWidth={2}
                        fill={`url(#gradient-${index})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.link}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 border-transparent hover:border-blue-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className={`p-4 rounded-xl ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts and Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Category Distribution Chart */}
        <Card className="lg:col-span-2 overflow-hidden shadow-lg border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Category Distribution</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {Object.keys(stats?.categoryWiseCount || {}).length} Categories
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={index} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={designChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {designChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#colorGradient${index % COLORS.length})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <Card className="overflow-hidden shadow-lg border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-xl">Quick Stats</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {additionalStats.map((stat, index) => (
              <div key={stat.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-gradient-to-br ${
                      index === 0 ? 'from-blue-50 to-blue-100' :
                      index === 1 ? 'from-red-50 to-red-100' :
                      'from-green-50 to-green-100'
                    } rounded-lg shadow-sm`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{stat.title}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{stat.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={stat.percentage} 
                    className="h-2"
                  />
                </div>
                {index < additionalStats.length - 1 && (
                  <div className="border-b border-muted" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend Chart */}
      <Card className="overflow-hidden shadow-lg border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Growth Trend</CardTitle>
            </div>
            <Badge variant="secondary">Last 6 Months</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDesigns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="designs" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDesigns)" 
                  name="Designs"
                />
                <Area 
                  type="monotone" 
                  dataKey="products" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProducts)"
                  name="Products"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-6 h-6 opacity-50" />
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-90">Top Category</p>
              <p className="text-2xl font-bold">
                {designChartData.length > 0 
                  ? designChartData.reduce((a, b) => a.value > b.value ? a : b).name 
                  : 'N/A'}
              </p>
              <p className="text-xs opacity-75">Most popular design category</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-50" />
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-90">Conversion Rate</p>
              <p className="text-2xl font-bold">24.5%</p>
              <p className="text-xs opacity-75">+5.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Star className="w-6 h-6" />
              </div>
              <Sparkles className="w-6 h-6 opacity-50" />
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-90">Avg. Rating</p>
              <p className="text-2xl font-bold">4.8/5.0</p>
              <p className="text-xs opacity-75">Based on user feedback</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
