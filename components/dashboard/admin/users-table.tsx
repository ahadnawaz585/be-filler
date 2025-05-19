"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAdminUsers } from "@/lib/constants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Filter, ArrowUpDown } from "lucide-react"
import { UserService } from "@/services/user.service"
import { User } from "@/types/users"

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("registrationDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const userService = new UserService()
        const response = await userService.getAllUsers()
        setUsers(response)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

// Filter users based on search term and filters
const filteredUsers = mockAdminUsers.filter((user) => {
  // Search term filter
  const matchesSearch =
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())

  // Role filter
  const matchesRole = roleFilter === "all" || user.role === roleFilter

  // Status filter
  const matchesStatus = statusFilter === "all" || user.status === statusFilter

  return matchesSearch && matchesRole && matchesStatus
})

// Sort users
const sortedUsers = [...filteredUsers].sort((a, b) => {
  let aValue = a[sortField as keyof typeof a]
  let bValue = b[sortField as keyof typeof b]

  // Handle date comparison
  if (sortField === "registrationDate") {
    aValue = new Date(aValue as string).getTime()
    bValue = new Date(bValue as string).getTime()
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
          <CardDescription>Manage your registered users</CardDescription>
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
            placeholder="Search users..."
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
                ID
                {sortField === "id" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Name
                {sortField === "name" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead onClick={() => handleSort("role")} className="cursor-pointer">
                Role
                {sortField === "role" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead onClick={() => handleSort("registrationDate")} className="cursor-pointer">
                Registration Date
                {sortField === "registrationDate" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                Status
                {sortField === "status" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead onClick={() => handleSort("filings")} className="text-right cursor-pointer">
                Filings
                {sortField === "filings" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "Active" ? "default" : "secondary"}
                    className={user.status === "Active" ? "bg-green-500" : "bg-gray-500"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{ }</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
)
}
