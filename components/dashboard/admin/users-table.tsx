"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Filter, ArrowUpDown } from "lucide-react"
import { IUser } from "@/services/user.service"

interface UserTableProps {
  users: IUser[];
}

export function UsersTable({ users }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    // Search term filter - using actual IUser properties
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cnic.toLowerCase().includes(searchTerm.toLowerCase())

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    // Status filter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortField as keyof IUser]
    let bValue: any = b[sortField as keyof IUser]

    // Handle date comparison
    if (sortField === "createdAt") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle array length comparison (for documents)
    if (sortField === "documents") {
      aValue = (aValue as any[]).length
      bValue = (bValue as any[]).length
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage your registered users ({sortedUsers.length} total)</CardDescription>
          </div>
          <Button variant="outline" className="ml-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("cnic")} className="cursor-pointer">
                  CNIC
                  {sortField === "cnic" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("fullName")} className="cursor-pointer">
                  Name
                  {sortField === "fullName" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
                  Role
                  {sortField === "role" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                  Registration Date
                  {sortField === "createdAt" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                  Status
                  {sortField === "status" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("documents")} className="text-right cursor-pointer">
                  Docs
                  {sortField === "documents" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <TableRow key={user.cnic}>
                    <TableCell className="font-medium">{user.cnic}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "approved" ? "default" : "secondary"}
                        className={
                          user.status === "approved"
                            ? "bg-green-500 hover:bg-green-600"
                            : user.status === "pending"
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{user.documents?.length || 0}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}