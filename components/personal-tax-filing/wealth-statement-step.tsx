"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface OpeningWealthStepProps {
    formData: any
    handleInputChange: (field: string, value: any) => void
}

export function OpeningWealthStep({ formData, handleInputChange }: OpeningWealthStepProps) {
    const handleWealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Allow only numbers and empty string during input
        if (value === "" || /^\d+$/.test(value)) {
            handleInputChange("wealthStatement", {
                ...formData.wealthStatement,
                openingWealth: value === "" ? 0 : Number(value),
            })
        } else {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid number for opening wealth.",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-lg">Opening Wealth</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Enter your opening wealth for the tax year (in PKR).
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="openingWealth">Opening Wealth (PKR)</Label>
                        <Input
                            id="openingWealth"
                            type="text"
                            value={formData.wealthStatement?.openingWealth || ""}
                            onChange={handleWealthChange}
                            placeholder="Enter opening wealth"
                            className="max-w-sm"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}