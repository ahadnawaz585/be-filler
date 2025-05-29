"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Home, Car, Banknote, Shield, Gem, Globe, DollarSign, Layers } from "lucide-react"

interface AssetSelectionStepProps {
    formData: any
    handleInputChange: (field: string, value: any) => void
}

export default function AssetSelectionStep({ formData, handleInputChange }: AssetSelectionStepProps) {
    const assetTypes = [
        { id: "properties", label: "Properties", icon: Home },
        { id: "vehicles", label: "Vehicles", icon: Car },
        { id: "bankAccounts", label: "Bank Accounts", icon: Banknote },
        { id: "insurances", label: "Insurances", icon: Shield },
        { id: "possessions", label: "Possessions", icon: Gem },
        { id: "foreignAssets", label: "Foreign Assets", icon: Globe },
        { id: "cash", label: "Cash", icon: DollarSign },
        { id: "otherAssets", label: "Other Assets", icon: Layers },
    ]

    const handleAssetTypeChange = (assetId: string, checked: boolean) => {
        const currentSelected = Array.isArray(formData.selectedAssets) ? formData.selectedAssets : []
        const updatedSelected = checked
            ? [...currentSelected, assetId]
            : currentSelected.filter((id: string) => id !== assetId)
        handleInputChange("selectedAssets", updatedSelected)
    }

    return (
        <Card className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-700 to-red-500 text-white p-6">
                <CardTitle className="text-2xl font-bold">Select Your Assets</CardTitle>
                <p className="text-sm opacity-80">Choose the types of assets you want to declare</p>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {assetTypes.map((asset) => (
                        <div
                            key={asset.id}
                            className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer animate-fade-in"
                            onClick={() => handleAssetTypeChange(asset.id, !formData.selectedAssets?.includes(asset.id))}
                        >
                            <Checkbox
                                id={asset.id}
                                checked={formData.selectedAssets?.includes(asset.id) || false}
                                onCheckedChange={(checked) => handleAssetTypeChange(asset.id, !!checked)}
                                className="mr-3"
                            />
                            <div className="flex items-center space-x-2">
                                <asset.icon className="w-5 h-5 text-red-600" />
                                <Label htmlFor={asset.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                                    {asset.label}
                                </Label>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}