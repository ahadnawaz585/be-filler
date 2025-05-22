"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileCheck, Clock, DollarSign } from "lucide-react"
import { mockRevenueData } from "@/lib/constants"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { IMonthlyStats } from "@/services/reports.service"

interface StatsOverviewProps {
  activeUsers: number
  totalFilings: number
  pendingFilings: number
  monthlyStats: IMonthlyStats
}

export function StatsOverview({ activeUsers, totalFilings, pendingFilings, monthlyStats }: StatsOverviewProps) {

  // Convert monthlyStats object to array format for charts
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const chartData = monthNames.map((month, index) => {
    const monthData = monthlyStats[index] || monthlyStats[month] || {
      filings: 0,
      approved: 0,
      rejected: 0,
      pending: 0
    };

    return {
      month: month,
      filings: monthData.filings,
      approved: monthData.approved,
      rejected: monthData.rejected,
      pending: monthData.pending
    };
  });

  // Get current month data safely
  const currentMonth = new Date().getMonth();
  const currentMonthData = monthlyStats[currentMonth] || monthlyStats[monthNames[currentMonth]] || {
    filings: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  };

  // Get previous month data safely
  const previousMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
  const previousMonthData = monthlyStats[previousMonth] || monthlyStats[monthNames[previousMonth]] || {
    filings: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  };

  // Calculate month-over-month change
  const monthlyChange = currentMonthData.filings - previousMonthData.filings;
  const isPositiveChange = monthlyChange >= 0;

  // Revenue calculations (keeping mock data for now)
  const thisMonthRevenue = mockRevenueData[currentMonth]?.revenue || 0;
  const lastMonthRevenue = mockRevenueData[previousMonth]?.revenue || 0;
  const revenueChange = lastMonthRevenue !== 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeUsers} active users</p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filings Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Filings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalFilings}</div>
                <p className="text-xs text-muted-foreground mt-1">{pendingFilings} pending approval</p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Filing Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Filings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{currentMonthData.filings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPositiveChange ? "↑" : "↓"}
                  {Math.abs(monthlyChange)} from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {revenueChange >= 0 ? "↑" : "↓"}
                  {Math.abs(revenueChange).toFixed(1)}% from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#af0e0e]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Filings Chart - Using Real Data */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Filings</CardTitle>
            <CardDescription>Number of tax returns filed each month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value, name) => {
                      if (name === 'filings') return [value, 'Total Filings'];
                      if (name === 'approved') return [value, 'Approved'];
                      if (name === 'rejected') return [value, 'Rejected'];
                      if (name === 'pending') return [value, 'Pending'];
                      return [value, name];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="filings"
                    stroke="#af0e0e"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    name="filings"
                  />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="approved"
                  />
                  <Line
                    type="monotone"
                    dataKey="rejected"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="rejected"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="pending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart - Still using mock data */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue generated from tax filing services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockRevenueData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}