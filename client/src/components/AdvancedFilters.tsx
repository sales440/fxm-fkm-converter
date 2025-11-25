import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import type { AdvancedFilters as FilterType } from "@/lib/motorConverter";

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterType) => void;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
}

export default function AdvancedFilters({ onApplyFilters, onClearFilters, hasActiveFilters = false }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterType>({});
  
  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    setFilters({});
    onClearFilters();
    setIsOpen(false);
  };
  
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-primary text-primary hover:bg-primary hover:text-white"
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
      </Button>
    );
  }
  
  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">Advanced Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Filtros de Torque */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Torque (Mo) Range</h4>
            <div className="space-y-2">
              <Label htmlFor="moMin">Minimum (Nm)</Label>
              <Input
                id="moMin"
                type="number"
                placeholder="e.g., 10"
                value={filters.moMin || ''}
                onChange={(e) => setFilters({ ...filters, moMin: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moMax">Maximum (Nm)</Label>
              <Input
                id="moMax"
                type="number"
                placeholder="e.g., 50"
                value={filters.moMax || ''}
                onChange={(e) => setFilters({ ...filters, moMax: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
          
          {/* Filtros de Velocidad */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Speed (RPM) Range</h4>
            <div className="space-y-2">
              <Label htmlFor="rpmMin">Minimum (rpm)</Label>
              <Input
                id="rpmMin"
                type="number"
                placeholder="e.g., 2000"
                value={filters.rpmMin || ''}
                onChange={(e) => setFilters({ ...filters, rpmMin: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpmMax">Maximum (rpm)</Label>
              <Input
                id="rpmMax"
                type="number"
                placeholder="e.g., 3000"
                value={filters.rpmMax || ''}
                onChange={(e) => setFilters({ ...filters, rpmMax: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
          
          {/* Filtros de Dimensiones */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Maximum Dimensions</h4>
            <div className="space-y-2">
              <Label htmlFor="lMax">Length (L) mm</Label>
              <Input
                id="lMax"
                type="number"
                placeholder="e.g., 300"
                value={filters.lMax || ''}
                onChange={(e) => setFilters({ ...filters, lMax: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acMax">Housing (AC) mm</Label>
              <Input
                id="acMax"
                type="number"
                placeholder="e.g., 150"
                value={filters.acMax || ''}
                onChange={(e) => setFilters({ ...filters, acMax: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
