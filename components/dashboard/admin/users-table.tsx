"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Filter, ArrowUpDown, RefreshCw, Edit, MoreHorizontal } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { UserModal } from "@/components/dashboard/admin/user-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { User } from "@/types/users"

export function UsersTable() {
  const {
    filteredUsers,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    refreshUsers,
    handleSort,
    addUser,
    updateUser,
  } = useUsers()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Handle opening the add user modal
  const handleAddUser = () => {
    setModalMode("add")
    setCurrentUser(null)
    setIsModalOpen(true)
  }

  // Handle opening the edit user modal
  const handleEditUser = (user: User) => {
    setModalMode("edit")
    setCurrentUser(user)
    setIsModalOpen(true)
  }

  // Handle toggling user status
  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active"
    updateUser({
      ...user,
      status: newStatus,
    })
  }

  // Handle saving user from modal
  const handleSaveUser = (userData: User) => {
    if (modalMode === "add") {
      addUser(userData)
    } else {
      updateUser(userData)
    }
    setIsModalOpen(false)
  }

  // Show loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
            <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="h-10 flex-grow bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-[130px] bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-[130px] bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="h-10 w-full bg-gray-200 rounded-t animate-pulse"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage your registered users
                {error && <span className="text-red-500 ml-2">{error}</span>}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshUsers} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" onClick={handleAddUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No users found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
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
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.status === "Active" ? "Deactivate" : "Activate"} User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-right">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
          </div>
        </CardContent>
      </Card>

      {/* User Modal for Add/Edit */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={currentUser}
        mode={modalMode}
      />
    </>
  )
}
