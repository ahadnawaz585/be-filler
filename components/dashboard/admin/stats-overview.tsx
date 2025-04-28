"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Clock, DollarSign } from "lucide-react";
import { mockAdminUsers, mockRecentFilers, mockMonthlyFilings, mockRevenueData } from "@/lib/constants";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function StatsOverview() {
  // Calculate some stats
  const totalUsers = mockAdminUsers.length;
  const activeUsers = mockAdminUsers.filter(user => user.status === 'Active').length;
  const totalFilings = mockAdminUsers.reduce((sum, user) => sum + user.filings, 0);
  const pendingFilings = mockRecentFilers.filter(filing => filing.status === 'Under Review').length;
  
  // Revenue calculations
  const thisMonthRevenue = mockRevenueData[new Date().getMonth()].revenue;
  const lastMonthRevenue = mockRevenueData[new Date().getMonth() - 1 < 0 ? 11 : new Date().getMonth() - 1].revenue;
  const revenueChange = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeUsers} active users
                </p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Filings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalFilings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingFilings} pending approval
                </p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month Filings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{mockMonthlyFilings[new Date().getMonth()].filings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockMonthlyFilings[new Date().getMonth()].filings > mockMonthlyFilings[new Date().getMonth() - 1 < 0 ? 11 : new Date().getMonth() - 1].filings ? '↑' : '↓'} 
                  {Math.abs(mockMonthlyFilings[new Date().getMonth()].filings - mockMonthlyFilings[new Date().getMonth() - 1 < 0 ? 11 : new Date().getMonth() - 1].filings)} from last month
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
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {revenueChange >= 0 ? '↑' : '↓'} 
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
        {/* Monthly Filings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Filings</CardTitle>
            <CardDescription>
              Number of tax returns filed each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockMonthlyFilings}
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
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="filings"
                    stroke="var(--chart-1)"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue generated from tax filing services
            </CardDescription>
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
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                    formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-2)"
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
  );
}