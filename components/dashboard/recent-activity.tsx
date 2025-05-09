"use client"

import { Activity, FileText, BarChart3, Bell, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTaxReturns, mockWealthStatements, mockNotifications } from "@/lib/constants"
import { formatDate } from "@/lib/utils"

export function RecentActivity() {
  // Combine all activities into one array
  const activities = [
    ...mockTaxReturns.map((item) => ({
      id: item.id,
      type: "tax-return",
      title: `Tax return filed for ${item.taxYear}`,
      date: item.filingDate,
      status: item.status,
    })),
    ...mockWealthStatements.map((item) => ({
      id: item.id,
      type: "wealth-statement",
      title: `Wealth statement filed for ${item.taxYear}`,
      date: item.filingDate,
      status: item.status,
    })),
    ...mockNotifications.map((item) => ({
      id: item.id,
      type: "notification",
      title: item.title,
      date: item.date,
      message: item.message,
      read: item.read,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const getIcon = (activity: any) => {
    switch (activity.type) {
      case "tax-return":
        return <FileText className="h-4 w-4" />
      case "wealth-statement":
        return <BarChart3 className="h-4 w-4" />
      case "notification":
        return <Bell className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusIcon = (activity: any) => {
    if (activity.type === "notification") return null

    if (activity.status === "Completed") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    } else {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities.map((activity: any, index) => (
            <div key={activity.id} className="flex gap-4">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === "tax-return"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : activity.type === "wealth-statement"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : "bg-[#af0e0e]/10 text-[#af0e0e]"
                }`}
              >
                {getIcon(activity)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{activity.title}</p>
                  {getStatusIcon(activity)}
                </div>

                {activity.type === "notification" && (
                  <p className="text-sm text-muted-foreground">{activity.message}</p>
                )}

                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" /> {formatDate(activity.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
