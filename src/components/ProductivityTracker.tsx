'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download } from 'lucide-react'
import { saveAs } from 'file-saver'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

interface Task {
  id: number
  employeeName: string
  category: string
  description: string
  notes: string
  hours: number
  startDate: string
  endDate: string
}

interface User {
  id: string
  email: string
  name: string
  role: 'employee' | 'supervisor'
  password: string
  createdAt: string
}

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  email: string
  password: string
  name: string
  role: 'employee' | 'supervisor'
}

interface LoginScreenProps {
  showRegister: boolean
  showForgotPassword: boolean
  rememberMe: boolean
  loginForm: LoginFormData
  registerForm: RegisterFormData
  forgotPasswordEmail: string
  handleLogin: (e: React.FormEvent) => void
  handleRegister: (e: React.FormEvent) => void
  handleForgotPassword: (e: React.FormEvent) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRegisterChange: (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  setShowRegister: (show: boolean) => void
  setShowForgotPassword: (show: boolean) => void
  setRememberMe: (remember: boolean) => void
  setForgotPasswordEmail: (email: string) => void
}

interface EmployeeViewProps {
  startDate: string
  endDate: string
  selectedCategory: string
  customTask: string
  taskNotes: string
  hours: string
  selectedDate: string
  categories: Array<{ id: number; name: string }>
  hoursOptions: number[]
  tasks: Task[]
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setSelectedCategory: (category: string) => void
  setCustomTask: (task: string) => void
  setTaskNotes: (notes: string) => void
  setHours: (hours: string) => void
  setSelectedDate: (date: string) => void
  handleAddTask: () => void
}

interface SupervisorViewProps {
  users: User[]
  tasks: Task[]
  generateDetailedReport: () => void
  generateEmployeeSummary: () => void
}

const LoginScreen: React.FC<LoginScreenProps> = React.memo(({ 
    showRegister,
    showForgotPassword,
    rememberMe,
    loginForm,
    registerForm,
    forgotPasswordEmail,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleInputChange,
    handleRegisterChange,
    setShowRegister,
    setShowForgotPassword,
    setRememberMe,
    setForgotPasswordEmail
  }) => {
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
                  placeholder="Full Name"
                  value={registerForm.name}
                  onChange={handleRegisterChange('name')}
                  className="w-full"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={registerForm.email}
                  onChange={handleRegisterChange('email')}
                  className="w-full"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={handleRegisterChange('password')}
                  className="w-full"
                  required
                />
                <select
                  value={registerForm.role}
                  onChange={handleRegisterChange('role')}
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
      )
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
      )
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
    )
  })

  const EmployeeView: React.FC<EmployeeViewProps> = React.memo(({ 
    startDate,
    endDate,
    selectedCategory,
    customTask,
    taskNotes,
    hours,
    selectedDate,
    categories,
    hoursOptions,
    tasks,
    setStartDate,
    setEndDate,
    setSelectedCategory,
    setCustomTask,
    setTaskNotes,
    setHours,
    setSelectedDate,
    handleAddTask
  }) => (
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
                    setTaskNotes(e.target.value)
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
                const taskStartDate = new Date(task.startDate)
                const taskEndDate = new Date(task.endDate)
                const selectedDateObj = new Date(selectedDate)
                return selectedDateObj >= taskStartDate && selectedDateObj <= taskEndDate
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
  ))

  const SupervisorView: React.FC<SupervisorViewProps> = React.memo(({ 
    users,
    tasks,
    generateDetailedReport,
    generateEmployeeSummary
  }) => {
    const categoryDistributionData = useMemo(() => {
      return tasks.reduce((acc, task) => {
        const category = task.category
        const days = Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        const totalHours = task.hours * days
        
        const existingCategory = acc.find(item => item.name === category)
        if (existingCategory) {
          existingCategory.hours += totalHours
        } else {
          acc.push({ name: category, hours: totalHours })
        }
        return acc
      }, [] as { name: string; hours: number }[])
    }, [tasks])
  
    const monthlyTrendsData = useMemo(() => {
      const currentYear = new Date().getFullYear()
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
        hours: 0
      }))
  
      tasks.forEach(task => {
        const startDate = new Date(task.startDate)
        if (startDate.getFullYear() === currentYear) {
          const monthIndex = startDate.getMonth()
          const days = Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
          monthlyData[monthIndex].hours += task.hours * days
        }
      })
  
      return monthlyData
    }, [tasks])
  
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
  
    return (
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
                  const today = new Date().toISOString().split('T')[0]
                  return task.startDate <= today && task.endDate >= today
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
  
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
        <CardHeader>
          <CardTitle>Today's Active Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Employee</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Hours</th>
                  <th className="text-left py-3 px-4">Date Range</th>
                  <th className="text-left py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {tasks
                  .filter(task => {
                    const today = new Date().toISOString().split('T')[0]
                    return task.startDate <= today && task.endDate >= today
                  })
                  .sort((a, b) => {
                    // Sort by employee name first
                    if (a.employeeName < b.employeeName) return -1
                    if (a.employeeName > b.employeeName) return 1
                    // Then by category
                    return a.category.localeCompare(b.category)
                  })
                  .map(task => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{task.employeeName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {task.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{task.description}</td>
                      <td className="py-3 px-4">{task.hours} hrs/day</td>
                      <td className="py-3 px-4">
                        {task.startDate === task.endDate ? (
                          task.startDate
                        ) : (
                          <div className="text-xs">
                            <div>From: {task.startDate}</div>
                            <div>To: {task.endDate}</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {task.notes ? (
                          <span className="text-gray-600 italic">{task.notes}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {tasks.filter(task => {
                  const today = new Date().toISOString().split('T')[0]
                  return task.startDate <= today && task.endDate >= today
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No active tasks for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
  
  const ProductivityTracker: React.FC = () => {
    // State declarations
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [loginForm, setLoginForm] = useState<LoginFormData>({
      email: '',
      password: ''
    })
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
    ])
  
    const [showRegister, setShowRegister] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [registerForm, setRegisterForm] = useState<RegisterFormData>({
      email: '',
      password: '',
      name: '',
      role: 'employee'
    })
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  
    // Task management states
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [customTask, setCustomTask] = useState('')
    const [taskNotes, setTaskNotes] = useState('')
    const [hours, setHours] = useState('1')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
    // Constants
    const categories = [
      { id: 1, name: 'Sales' },
      { id: 2, name: 'Maintenance' },
      { id: 3, name: 'Customer Service' },
      { id: 4, name: 'Inspection' },
      { id: 5, name: 'Vacation' },
      { id: 6, name: 'Other' }
    ]
  
    const hoursOptions = Array.from({ length: 12 }, (_, i) => i + 1)
  
    // Effects
    useEffect(() => {
      const storedUser = localStorage.getItem('productivityUser')
      const storedExpiry = localStorage.getItem('productivityLoginExpiry')
      
      if (storedUser && storedExpiry) {
        const now = new Date().getTime()
        if (now < parseInt(storedExpiry)) {
          setUser(JSON.parse(storedUser))
          setIsLoggedIn(true)
        } else {
          localStorage.removeItem('productivityUser')
          localStorage.removeItem('productivityLoginExpiry')
        }
      }
    }, [])
  
    // Handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setLoginForm(prev => ({
        ...prev,
        [name]: value
      }))
    }, [])
  
    const handleRegisterChange = useCallback((field: keyof RegisterFormData) => 
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegisterForm(prev => ({
          ...prev,
          [field]: e.target.value
        }))
      }, 
      []
    )
  
    const handleLogin = useCallback((e: React.FormEvent) => {
      e.preventDefault()
      const foundUser = users.find(u => u.email === loginForm.email && u.password === loginForm.password)
      
      if (foundUser) {
        setUser(foundUser)
        setIsLoggedIn(true)
        
        if (rememberMe) {
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + 90)
          localStorage.setItem('productivityUser', JSON.stringify(foundUser))
          localStorage.setItem('productivityLoginExpiry', expiryDate.getTime().toString())
        }
      } else {
        alert('Invalid credentials')
      }
    }, [loginForm, users, rememberMe])
  
    const handleRegister = useCallback((e: React.FormEvent) => {
      e.preventDefault()
      const { email, password, name, role } = registerForm
      
      if (!email || !password || !name) {
        alert('Please fill in all fields')
        return
      }
      
      if (users.some(u => u.email === email)) {
        alert('Email already registered')
        return
      }
  
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role,
        password,
        createdAt: new Date().toISOString()
      }
  
      setUsers(prev => [...prev, newUser])
      setShowRegister(false)
      alert('Registration successful! Please login.')
    }, [registerForm, users])
  
    const handleForgotPassword = useCallback((e: React.FormEvent) => {
      e.preventDefault()
      const user = users.find(u => u.email === forgotPasswordEmail)
      
      if (user) {
        alert('Password reset instructions sent to your email')
        setShowForgotPassword(false)
      } else {
        alert('Email not found')
      }
    }, [forgotPasswordEmail, users])
  
    const handleAddTask = useCallback(() => {
      if (!selectedCategory || !hours || !user || !startDate || !endDate) return
      
      if (new Date(endDate) < new Date(startDate)) {
        alert('End date cannot be before start date')
        return
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
      }
      
      setTasks(prev => [...prev, newTask])
      setSelectedCategory('')
      setCustomTask('')
      setTaskNotes('')
      setHours('1')
    }, [selectedCategory, hours, user, startDate, endDate, customTask, taskNotes])
  
    const generateDetailedReport = useCallback(() => {
      const report = tasks.map(task => ({
        Employee: task.employeeName,
        Category: task.category,
        Description: task.description,
        Hours: task.hours,
        StartDate: task.startDate,
        EndDate: task.endDate,
        TotalDays: Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        TotalHours: task.hours * (Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
      }))
      
      const blob = new Blob([
        Object.keys(report[0]).join(',') + '\n' +
        report.map(row => Object.values(row).join(',')).join('\n')
      ], { type: 'text/csv;charset=utf-8' })
      
      saveAs(blob, `detailed_task_report_${new Date().toISOString().split('T')[0]}.csv`)
    }, [tasks])
  
    const generateEmployeeSummary = useCallback(() => {
      const employeeSummary = users
        .filter(u => u.role === 'employee')
        .map(employee => {
          const employeeTasks = tasks.filter(task => task.employeeName === employee.name)
          const totalHours = employeeTasks.reduce((sum, task) => {
            const days = Math.floor((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            return sum + (task.hours * days)
          }, 0)
  
          return {
            Employee: employee.name,
            Email: employee.email,
            TotalTasks: employeeTasks.length,
            TotalHours: totalHours
          }
        })
  
      const blob = new Blob([
        Object.keys(employeeSummary[0]).join(',') + '\n' +
        employeeSummary.map(row => Object.values(row).join(',')).join('\n')
      ], { type: 'text/csv;charset=utf-8' })
      
      saveAs(blob, `employee_summary_${new Date().toISOString().split('T')[0]}.csv`)
    }, [users, tasks])
  
    if (!isLoggedIn) {
      return (
        <LoginScreen 
          showRegister={showRegister}
          showForgotPassword={showForgotPassword}
          rememberMe={rememberMe}
          loginForm={loginForm}
          registerForm={registerForm}
          forgotPasswordEmail={forgotPasswordEmail}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          handleForgotPassword={handleForgotPassword}
          handleInputChange={handleInputChange}
          handleRegisterChange={handleRegisterChange}
          setShowRegister={setShowRegister}
          setShowForgotPassword={setShowForgotPassword}
          setRememberMe={setRememberMe}
          setForgotPasswordEmail={setForgotPasswordEmail}
        />
      )
    }
  
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <img 
                   src="/images/logo.png"
                   alt="Epic Colorado Adventures Logo"
                  className="h-20 w-auto object-contain"
                />
                <span className="text-xl font-bold">Productivity Tracker</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{user?.name}</span>
                <Button
                  onClick={() => {
                    setIsLoggedIn(false)
                    setUser(null)
                    localStorage.removeItem('productivityUser')
                    localStorage.removeItem('productivityLoginExpiry')
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
          {user?.role === 'employee' ? (
            <EmployeeView 
              startDate={startDate}
              endDate={endDate}
              selectedCategory={selectedCategory}
              customTask={customTask}
              taskNotes={taskNotes}
              hours={hours}
              selectedDate={selectedDate}
              categories={categories}
              hoursOptions={hoursOptions}
              tasks={tasks}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setSelectedCategory={setSelectedCategory}
              setCustomTask={setCustomTask}
              setTaskNotes={setTaskNotes}
              setHours={setHours}
              setSelectedDate={setSelectedDate}
              handleAddTask={handleAddTask}
            />
          ) : (
            <SupervisorView 
              users={users}
              tasks={tasks}
              generateDetailedReport={generateDetailedReport}
              generateEmployeeSummary={generateEmployeeSummary}
            />
          )}
        </main>
      </div>
    )
  }
  
  export default ProductivityTracker
