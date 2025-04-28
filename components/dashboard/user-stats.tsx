"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  BarChart3, 
  Bell, 
  ArrowRight, 
  ClipboardCheck, 
  Clock 
} from "lucide-react";
import { mockTaxReturns, mockWealthStatements, mockNotifications } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export function UserStats() {
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;
  const lastTaxReturn = mockTaxReturns[0];
  const lastWealthStatement = mockWealthStatements[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tax Returns Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">Tax Returns</CardTitle>
              <CardDescription>
                Filed tax returns history
              </CardDescription>
            </div>
            <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#af0e0e]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Latest Return</span>
              <span className="text-sm font-medium">{lastTaxReturn.taxYear}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Filing Date</span>
              <span className="text-sm font-medium">{formatDate(lastTaxReturn.filingDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  lastTaxReturn.status === 'Completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {lastTaxReturn.status}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tax Amount</span>
              <span className="text-sm font-medium">{formatCurrency(lastTaxReturn.taxAmount)}</span>
            </div>
            {lastTaxReturn.refundAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Refund</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(lastTaxReturn.refundAmount)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/tax-returns" className="w-full">
            <Button variant="outline" className="w-full">
              View All Returns <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Wealth Statement Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">Wealth Statements</CardTitle>
              <CardDescription>
                Assets and liabilities declaration
              </CardDescription>
            </div>
            <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-[#af0e0e]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Latest Statement</span>
              <span className="text-sm font-medium">{lastWealthStatement.taxYear}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Filing Date</span>
              <span className="text-sm font-medium">{formatDate(lastWealthStatement.filingDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  lastWealthStatement.status === 'Completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {lastWealthStatement.status}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Assets</span>
              <span className="text-sm font-medium">{formatCurrency(lastWealthStatement.totalAssets)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Liabilities</span>
              <span className="text-sm font-medium">{formatCurrency(lastWealthStatement.totalLiabilities)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/wealth-statements" className="w-full">
            <Button variant="outline" className="w-full">
              View All Statements <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Notifications Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">Notifications</CardTitle>
              <CardDescription>
                Recent updates and alerts
              </CardDescription>
            </div>
            <div className="w-10 h-10 bg-[#af0e0e]/10 rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-[#af0e0e]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockNotifications.slice(0, 3).map((notification, index) => (
              <div key={notification.id} className={`flex items-start gap-4 ${index !== 0 ? 'pt-3 border-t' : ''}`}>
                <div className={`w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-[#af0e0e]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> {formatDate(notification.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/notifications" className="w-full">
            <Button variant="outline" className="w-full">
              View All Notifications 
              {unreadNotifications > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#af0e0e] px-2 py-0.5 text-xs text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}