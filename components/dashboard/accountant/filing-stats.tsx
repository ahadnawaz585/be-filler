"use client"

import { useEffect, useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const defaultMonthlyFilings = [
  { month: "Jan", filings: 20 },
  { month: "Feb", filings: 35 },
  { month: "Mar", filings: 50 },
  { month: "Apr", filings: 40 },
  { month: "May", filings: 60 },
  { month: "Jun", filings: 45 },
]

const defaultFilingStatusData = [
  { name: "Completed", value: 158, color: "var(--chart-1)" },
  { name: "Under Review", value: 42, color: "var(--chart-2)" },
  { name: "Not Started", value: 23, color: "var(--chart-3)" },
]

const defaultFilingTypesData = [
  { name: "Income Tax", value: 120, color: "var(--chart-4)" },
  { name: "Wealth Statement", value: 65, color: "var(--chart-5)" },
  { name: "Corporate Tax", value: 38, color: "var(--chart-1)" },
]

export function FilingStats() {
  const [monthlyFilings, setMonthlyFilings] = useState(defaultMonthlyFilings)
  const [filingStatusData, setFilingStatusData] = useState(defaultFilingStatusData)
  const [filingTypesData, setFilingTypesData] = useState(defaultFilingTypesData)

  useEffect(() => {
    const storedMonthlyFilings = localStorage.getItem("monthlyFilings")
    const storedFilingStatus = localStorage.getItem("filingStatusData")
    const storedFilingTypes = localStorage.getItem("filingTypesData")

    if (storedMonthlyFilings) {
      setMonthlyFilings(JSON.parse(storedMonthlyFilings))
    }
    if (storedFilingStatus) {
      setFilingStatusData(JSON.parse(storedFilingStatus))
    }
    if (storedFilingTypes) {
      setFilingTypesData(JSON.parse(storedFilingTypes))
    }
  }, [])

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
                data={monthlyFilings}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
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

      {/* Filing Status Pie Chart */}
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
