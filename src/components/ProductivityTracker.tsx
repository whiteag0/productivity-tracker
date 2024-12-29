'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Task {
    id: number;
    employeeName: string;
    category: string;
    description: string;
    notes: string;  // Add this line
    hours: number;
    startDate: string;
    endDate: string;
  }

interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'supervisor';
  password: string;
  createdAt: string;
}

const ProductivityTracker = () => {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'test@test.com',
      name: 'John Smith',
      role: 'employee',
      password: 'test',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'supervisor',
      password: 'admin',
      createdAt: new Date().toISOString()
    }
  ]);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee' as 'employee' | 'supervisor'
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  // Task management states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customTask, setCustomTask] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [hours, setHours] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    { id: 1, name: 'Sales' },
    { id: 2, name: 'Maintenance' },
    { id: 3, name: 'Customer Service' },
    { id: 4, name: 'Inspection' },
    { id: 5, name: 'Vacation' },
    { id: 6, name: 'Other' }
  ];

  const hoursOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const storedUser = localStorage.getItem('productivityUser');
    const storedExpiry = localStorage.getItem('productivityLoginExpiry');
    
    if (storedUser && storedExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(storedExpiry)) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('productivityUser');
        localStorage.removeItem('productivityLoginExpiry');
      }
    }
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const generateDetailedReport = () => {
    const report = tasks.map(task => ({
      Employee: task.employeeName,
      Category: task.category,
      Description: task.description,
      Hours: task.hours,
      StartDate: task.startDate,
      EndDate: task.endDate,
      TotalDays: Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      TotalHours: task.hours * (Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
    }));
    
    exportToCSV(report, 'detailed_task_report');
  };

  const generateEmployeeSummary = () => {
    const employeeSummary = users
      .filter(u => u.role === 'employee')
      .map(employee => {
        const stats = calculateYearToDateStats(employee.name);
        return {
          Employee: employee.name,
          Email: employee.email,
          ...stats.reduce((acc, stat) => ({
            ...acc,
            [stat.category]: stat.totalHours
          }), {}),
          TotalHours: stats.reduce((sum, stat) => sum + stat.totalHours, 0)
        };
      });

    exportToCSV(employeeSummary, 'employee_summary');
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    
    if (foundUser) {
      setUser(foundUser);
      setIsLoggedIn(true);
      
      if (rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90);
        localStorage.setItem('productivityUser', JSON.stringify(foundUser));
        localStorage.setItem('productivityLoginExpiry', expiryDate.getTime().toString());
      }
    } else {
      alert('Invalid credentials');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, name, role } = registerForm;
    
    if (users.some(u => u.email === email)) {
      alert('Email already registered');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      password,
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    setShowRegister(false);
    alert('Registration successful! Please login.');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === forgotPasswordEmail);
    
    if (user) {
      alert('Password reset instructions sent to your email');
      setShowForgotPassword(false);
    } else {
      alert('Email not found');
    }
  };

  const handleAddTask = () => {
    if (!selectedCategory || !hours || !user || !startDate || !endDate) return;
    
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date');
      return;
    }
  
    const newTask: Task = {
      id: Date.now(),
      employeeName: user.name,
      category: selectedCategory,
      description: customTask || selectedCategory,
      notes: taskNotes,
      hours: Number(hours),
      startDate,
      endDate
    };
    
    setTasks([...tasks, newTask]);
    setSelectedCategory('');
    setCustomTask('');
    setTaskNotes('');
    setHours('1');
  };
  const calculateYearToDateStats = (employeeName: string) => {
    const currentYear = new Date().getFullYear();
    const employeeTasks = tasks.filter(task => {
      const taskYear = new Date(task.startDate).getFullYear();
      return task.employeeName === employeeName && taskYear === currentYear;
    });

    const categoryTotals = categories.map(category => {
      const tasksInCategory = employeeTasks.filter(task => task.category === category.name);
      const totalHours = tasksInCategory.reduce((total, task) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return total + (task.hours * daysDiff);
      }, 0);

      return {
        category: category.name,
        totalHours
      };
    });

    return categoryTotals;
  };

  const getCategoryDistributionData = () => {
    return categories.map(category => ({
      name: category.name,
      hours: tasks.reduce((total, task) => {
        if (task.category === category.name) {
          const startDate = new Date(task.startDate);
          const endDate = new Date(task.endDate);
          const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return total + (task.hours * daysDiff);
        }
        return total;
      }, 0)
    }));
  };

  const getMonthlyTrends = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      hours: 0
    }));

    tasks.forEach(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      if (startDate.getFullYear() === currentYear) {
        const monthIndex = startDate.getMonth();
        const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        monthlyData[monthIndex].hours += task.hours * daysDiff;
      }
    });

    return monthlyData;
  };

  const EmployeeView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Task Description</label>
            <Input
              type="text"
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              placeholder="Enter task description"
              className="w-full"
            />
          </div>

          <div>
  <label className="block text-sm font-medium mb-1">Notes</label>
  <div className="relative">
    <Input
      type="text"
      value={taskNotes}
      onChange={(e) => {
        if (e.target.value.length <= 100) {
          setTaskNotes(e.target.value);
        }
      }}
      placeholder="Add additional details (100 characters max)"
      className="w-full pr-16"
    />
    <span className="absolute right-2 top-2 text-xs text-gray-400">
      {taskNotes.length}/100
    </span>
  </div>
</div>

          <div>
            <label className="block text-sm font-medium mb-1">Hours per Day</label>
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {hoursOptions.map(hour => (
                <option key={hour} value={hour}>
                  {hour} {hour === 1 ? 'hour' : 'hours'}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleAddTask} className="w-full">
            Add Task
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">View Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-4">
            {tasks
  .filter(task => {
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.endDate);
    const selectedDateObj = new Date(selectedDate);
    return selectedDateObj >= taskStartDate && selectedDateObj <= taskEndDate;
  })
  .map(task => (
    <div key={task.id} className="p-4 border rounded-md">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{task.category}</h4>
          <p className="text-sm text-gray-600">{task.description}</p>
          {task.notes && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Notes: {task.notes}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {task.hours} {task.hours === 1 ? 'hour' : 'hours'} per day
          </p>
          <p className="text-sm text-gray-400">
            {task.startDate === task.endDate 
              ? `Date: ${task.startDate}`
              : `Date Range: ${task.startDate} to ${task.endDate}`}
          </p>
          <p className="text-sm text-gray-400">Added by: {task.employeeName}</p>
        </div>
      </div>
    </div>
  ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SupervisorView = () => (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4 mb-6">
        <Button
          onClick={generateDetailedReport}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Detailed Report</span>
        </Button>
        <Button
          onClick={generateEmployeeSummary}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Employee Summary</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {users.filter(u => u.role === 'employee').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {tasks.filter(task => new Date(task.startDate).getFullYear() === new Date().getFullYear()).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {tasks.filter(task => {
                const today = new Date().toISOString().split('T')[0];
                return task.startDate <= today && task.endDate >= today;
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Category Distribution</CardTitle>
              <Button
                onClick={() => exportToCSV(getCategoryDistributionData(), 'category_distribution')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {getCategoryDistributionData().map((entry, index) => (
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
            <div className="flex justify-between items-center">
              <CardTitle>Monthly Hours Trend</CardTitle>
              <Button
                onClick={() => exportToCSV(getMonthlyTrends(), 'monthly_trends')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getMonthlyTrends()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" name="Total Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {users
        .filter(u => u.role === 'employee')
        .map(employee => (
          <Card key={employee.id} className="bg-gray-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{employee.name}</CardTitle>
                <Button
                  onClick={() => exportToCSV(calculateYearToDateStats(employee.name), `${employee.name.toLowerCase()}_stats`)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={calculateYearToDateStats(employee.name)}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalHours" fill="#82ca9d" name="Total Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
  const LoginScreen = () => {
    if (showRegister) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Card className="w-96">
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
              <img 
  src="/images/logo.png"
  alt="Epic Colorado Adventures Logo"
  className="h-20 w-auto object-contain"
/>
                <CardTitle className="text-2xl font-bold text-center">
                  Register New Account
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={registerForm.name}
                  onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full"
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full"
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full"
                  required
                />
                <select
                  value={registerForm.role}
                  onChange={e => setRegisterForm({...registerForm, role: e.target.value as 'employee' | 'supervisor'})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="supervisor">Supervisor</option>
                </select>
                <Button type="submit" className="w-full">
                  Register
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowRegister(false)}
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (showForgotPassword) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Card className="w-96">
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
              <img 
  src="/images/logo.png"
  alt="Epic Colorado Adventures Logo"
  className="h-20 w-auto object-contain"
/>
                <CardTitle className="text-2xl font-bold text-center">
                  Reset Password
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={forgotPasswordEmail}
                  onChange={e => setForgotPasswordEmail(e.target.value)}
                  className="w-full"
                  required
                />
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <div className="flex flex-col items-center space-y-4">
            <img 
  src="/images/logo.png"
  alt="Epic Colorado Adventures Logo"
  className="h-20 w-auto object-contain"
/>
              <CardTitle className="text-2xl font-bold text-center">
                Employee Productivity Tracker
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                Test Credentials:
                <br />
                Employee: test@test.com / test
                <br />
                Supervisor: admin@test.com / admin
              </AlertDescription>
            </Alert>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={handleInputChange}
                className="w-full"
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me for 90 days
                </label>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-blue-600 hover:underline"
                >
                  Register New Account
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* This is the part you need to update */}
              <img 
                src="/images/logo.png"
                alt="Epic Colorado Adventures Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold">Productivity Tracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{user?.name}</span>
              <Button
                onClick={() => {
                  setIsLoggedIn(false);
                  setUser(null);
                  localStorage.removeItem('productivityUser');
                  localStorage.removeItem('productivityLoginExpiry');
                }}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user?.role === 'employee' ? <EmployeeView /> : <SupervisorView />}
      </main>
    </div>
  );
};

export default ProductivityTracker;