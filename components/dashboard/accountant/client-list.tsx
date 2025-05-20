"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, FileText, ArrowUpDown } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { AddClientModal } from "./add-client-modal";
import { LocalStorage } from "@/services/localStorage/localStorage"

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [clients, setClients] = useState<any>([])
  const [showAddModal, setShowAddModal] = useState(false)

  // Load clients from localStorage on mount
  useEffect(() => {
    const data = LocalStorage.getItem("clients") || []
    setClients(Array.isArray(data) ? data : [])
  }, [showAddModal]) // reload when modal closes after adding client

  const filteredClients = clients.filter((client: any) =>
    [client.name, client.email, client.id].some((field: string) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a]
    let bValue: any = b[sortField as keyof typeof b]

    if (sortField === "latestFiling" && aValue !== "-" && bValue !== "-") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    return sortDirection === "asc"
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1
  })

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
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage your tax filing clients</CardDescription>
          </div>
          <Button variant="outline" className="ml-auto" onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button className="bg-[#af0e0e] hover:bg-[#8a0b0b]">
            <FileText className="h-4 w-4 mr-2" />
            New Tax Filing
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
                  ID {sortField === "id" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Name {sortField === "name" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead onClick={() => handleSort("filings")} className="cursor-pointer">
                  Filings {sortField === "filings" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("latestFiling")} className="cursor-pointer">
                  Latest Filing {sortField === "latestFiling" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                  Status {sortField === "status" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.filings}</TableCell>
                  <TableCell>{client.latestFiling !== "-" ? formatDate(client.latestFiling) : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        client.status === "Completed"
                          ? "border-green-500 text-green-500"
                          : client.status === "Under Review"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-gray-500 text-gray-500"
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddClientModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </Card>
  )
}
