
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  getAllProjects, 
  getAllPaymentRequests, 
  getAllUsers, 
  getAllVehicles,
  getLeaderProgressStats
} from '@/lib/storage';
import { Project, PaymentRequest, User, Vehicle, LeaderProgressStats } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Clock, Percent, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leaderStats, setLeaderStats] = useState<LeaderProgressStats[]>([]);
  
  // Stats
  const [totalCompletedWork, setTotalCompletedWork] = useState(0);
  const [totalPlannedWork, setTotalPlannedWork] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  
  // Charts data
  const [userRolesData, setUserRolesData] = useState<any[]>([]);
  const [projectStatusData, setProjectStatusData] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch all data
    const allProjects = getAllProjects();
    setProjects(allProjects);
    
    const allPayments = getAllPaymentRequests();
    setPayments(allPayments);
    
    const allUsers = getAllUsers();
    setUsers(allUsers);
    
    const allVehicles = getAllVehicles();
    setVehicles(allVehicles);
    
    // Get leader progress stats
    const stats = getLeaderProgressStats();
    setLeaderStats(stats);
    
    // Calculate stats
    const completed = allProjects.reduce((sum, project) => sum + project.completedWork, 0);
    const planned = allProjects.reduce((sum, project) => sum + project.totalWork, 0);
    setTotalCompletedWork(completed);
    setTotalPlannedWork(planned);
    
    const paidAmount = allPayments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.totalAmount, 0);
    setTotalPaid(paidAmount);
    
    const pendingCount = allPayments
      .filter(payment => payment.status === 'pending' || payment.status === 'approved')
      .length;
    setPendingPayments(pendingCount);
    
    // Prepare chart data
    const roleCount = allUsers.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    setUserRolesData(
      Object.entries(roleCount).map(([role, count]) => ({
        name: role,
        value: count
      }))
    );
    
    // Project status data
    const completedProjects = allProjects.filter(p => 
      p.completedWork >= p.totalWork
    ).length;
    
    const inProgressProjects = allProjects.filter(p => 
      p.completedWork > 0 && p.completedWork < p.totalWork
    ).length;
    
    const notStartedProjects = allProjects.filter(p => 
      p.completedWork === 0
    ).length;
    
    setProjectStatusData([
      { name: "Completed", value: completedProjects },
      { name: "In Progress", value: inProgressProjects },
      { name: "Not Started", value: notStartedProjects }
    ].filter(item => item.value > 0));
    
  }, []);
  
  const getOverallProgress = () => {
    if (totalPlannedWork === 0) return 0;
    return Math.round((totalCompletedWork / totalPlannedWork) * 100);
  };

  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{users.filter(u => u.role === 'leader').length} Leaders</Badge>
              <Badge>{users.filter(u => u.role === 'checker').length} Checkers</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/credentials')}>
              Manage Users
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.length}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">{getOverallProgress()}% Overall Progress</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vehicles.length}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/vehicles')}>
              Manage Vehicles
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹ {totalPaid.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">{pendingPayments} pending</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Team Leaders Progress Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Team Leaders Progress</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaderStats.map(leader => (
            <Card key={leader.leaderId}>
              <CardHeader>
                <CardTitle>{leader.leaderName}</CardTitle>
                <CardDescription>
                  {leader.projectCount} Projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Percent size={16} className="mr-2 text-muted-foreground" />
                      <span>Progress:</span>
                    </div>
                    <span className="font-medium">{leader.completionPercentage}%</span>
                  </div>
                  <Progress value={leader.completionPercentage} />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Distance</div>
                      <div className="font-medium">{leader.totalDistance} meters</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Time Spent</div>
                      <div className="font-medium">{formatTime(leader.totalTime)}</div>
                    </div>
                  </div>
                </div>
                
                {leader.recentUpdates.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">Latest Update</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(leader.recentUpdates[0].date).toLocaleDateString()}:
                      {' '}{leader.recentUpdates[0].completedWork} meters in {leader.recentUpdates[0].timeTaken} hours
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="sm"
                  onClick={() => navigate('/admin/statistics')}
                >
                  View Detailed Stats
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>
              Users by role
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {userRolesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRolesData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRolesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>
              Current status of all projects
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Completed' ? '#00C49F' : entry.name === 'In Progress' ? '#FFBB28' : '#FF8042'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No project data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Manage Users</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/admin/credentials')}
                  >
                    View Users
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Manage Vehicles</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/admin/vehicles')}
                  >
                    View Vehicles
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Manage Drivers</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/admin/drivers')}
                  >
                    View Drivers
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">View Statistics</CardTitle>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/admin/statistics')}
                  >
                    View Stats
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
