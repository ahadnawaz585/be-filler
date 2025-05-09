"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { mockMonthlyFilings } from "@/lib/constants"

export function FilingStats() {
  // Mock data for pie chart
  const filingStatusData = [
    { name: "Completed", value: 158, color: "var(--chart-1)" },
    { name: "Under Review", value: 42, color: "var(--chart-2)" },
    { name: "Not Started", value: 23, color: "var(--chart-3)" },
  ]

  // Mock data for filing types
  const filingTypesData = [
    { name: "Income Tax", value: 120, color: "var(--chart-4)" },
    { name: "Wealth Statement", value: 65, color: "var(--chart-5)" },
    { name: "Corporate Tax", value: 38, color: "var(--chart-1)" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Filings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Filings</CardTitle>
          <CardDescription>Tax returns processed per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="filings" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filing Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Filing Status</CardTitle>
          <CardDescription>Status distribution of tax filings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {filingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
