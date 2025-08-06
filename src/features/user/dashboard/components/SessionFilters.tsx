'use client';

import { Search } from 'lucide-react';

import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/components/ui/select';
import { Slider } from '@/src/shared/components/ui/slider';

import { statusOptions, templateOptions } from '../data/mockData';
import { FilterOptions } from '../types';

interface SessionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function SessionFilters({ filters, onFiltersChange }: SessionFiltersProps) {
  const handleTemplateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      template: value
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value
    });
  };

  const handleSatisfactionChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      satisfaction: value
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value
    });
  };

  const handleDateRangeClick = () => {
    // TODO: Implement date picker modal
    console.log('Date range picker not implemented yet');
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Button
            variant="outline"
            onClick={handleDateRangeClick}
            className="w-full justify-start text-left font-normal"
          >
            📅 Pick a date range
          </Button>
        </div>

        {/* Template */}
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={filters.template} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((template) => (
                <SelectItem key={template} value={template}>
                  {template}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Satisfaction Slider */}
        <div className="space-y-2">
          <Label>Min. Satisfaction</Label>
          <div className="px-3 py-2">
            <Slider
              value={filters.satisfaction}
              onValueChange={handleSatisfactionChange}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1★</span>
              <span>5★</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Session ID or keyword..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}