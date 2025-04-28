"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRecentFilers } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock } from "lucide-react";

export function RecentFilers() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Tax Filers</CardTitle>
            <CardDescription>
              Most recent tax returns filed
            </CardDescription>
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="h-4 w-4 mr-1" /> Last updated: {formatDate(new Date().toISOString())}
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
            {mockRecentFilers.map((filer) => (
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
                      filer.status === 'Completed'
                        ? 'border-green-500 text-green-500'
                        : 'border-yellow-500 text-yellow-500'
                    }
                  >
                    {filer.status === 'Completed' ? (
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
  );
}