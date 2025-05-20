"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileCheck, Clock, RefreshCw } from "lucide-react"
import { useFilersData } from "@/hooks/user-filers-data"

export function RecentFilers() {
  const { filers, isLoading, isRefreshing, lastUpdated, refreshData } = useFilersData()

  // Show loading skeleton
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Tax Filers</CardTitle>
            <CardDescription>Most recent tax returns filed</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="h-4 w-4 mr-1" /> Last updated: {formatDate(lastUpdated)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Tax Year</TableHead>
              <TableHead>Filing Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filers.map((filer: any) => (
              <TableRow key={filer.id}>
                <TableCell className="font-medium">{filer.id}</TableCell>
                <TableCell>{filer.user}</TableCell>
                <TableCell>{filer.taxYear}</TableCell>
                <TableCell>{formatDate(filer.filingDate)}</TableCell>
                <TableCell>{formatCurrency(filer.taxAmount)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      filer.status === "Completed"
                        ? "border-green-500 text-green-500"
                        : "border-yellow-500 text-yellow-500"
                    }
                  >
                    {filer.status === "Completed" ? (
                      <FileCheck className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {filer.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
