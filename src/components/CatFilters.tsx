'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, MapPin } from 'lucide-react';

export function CatFilters() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold font-headline">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Select>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                    <SelectItem value="25">Within 25 km</SelectItem>
                    <SelectItem value="50">Any distance</SelectItem>
                </SelectContent>
                </Select>
            </div>
            {/* Add more filters here as needed */}
        </div>
      </CardContent>
    </Card>
  );
}
