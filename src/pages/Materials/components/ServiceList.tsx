import React, { useState } from 'react';
import { Service } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMaterialsData } from '../hooks/useMaterials';

export function ServiceList() {
  const { queries, mutations } = useMaterialsData();
  const { data: services, isLoading } = queries.services;
  const { data: units } = queries.units;

  const [searchTerm, setSearchTerm] = useState('');
  const [hideInactive, setHideInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const serviceData = {
      service_name: data.name,
      service_code: data.item_code || null,
      description: data.display_name,
      unit: data.unit,
      sale_price: parseFloat(data.sale_price as string) || 0,
      purchase_price: parseFloat(data.purchase_price as string) || 0,
      tax_rate: parseFloat(data.gst_rate as string) || 0,
      hsn_code: data.hsn_code,
      is_active: true
    };

    if (editingService) {
      mutations.updateService.mutate({ id: editingService.id, ...serviceData }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      mutations.addService.mutate(serviceData, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const filteredServices = services?.filter(s => {
    const matchesSearch = s.service_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (s.service_code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = !hideInactive || s.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search services..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 md:h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="hide-inactive-services" 
              checked={hideInactive} 
              onCheckedChange={(checked) => setHideInactive(!!checked)} 
            />
            <Label htmlFor="hide-inactive-services" className="text-sm cursor-pointer">Hide Inactive</Label>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingService(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9">
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit' : 'Add New'} Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input id="name" name="name" defaultValue={editingService?.service_name || ''} placeholder="e.g. Installation" required className="h-11 md:h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Description</Label>
                  <Input id="display_name" name="display_name" defaultValue={editingService?.description || ''} placeholder="Short description" className="h-11 md:h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_code">Service Code</Label>
                  <Input id="item_code" name="item_code" defaultValue={editingService?.service_code || ''} placeholder="e.g. SRV-001" className="h-11 md:h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input id="unit" name="unit" defaultValue={editingService?.unit || ''} placeholder="e.g. Lumpsum" required className="h-11 md:h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={editingService?.sale_price || 0} className="h-11 md:h-9" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Service</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold uppercase font-sans">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Unit</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans text-right">Price</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading services...</TableCell></TableRow>
            ) : filteredServices?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No services found.</TableCell></TableRow>
            ) : filteredServices?.map(service => (
              <TableRow key={service.id} className="hover:bg-slate-50/50">
                <TableCell className="text-xs font-sans font-medium">{service.service_name}</TableCell>
                <TableCell className="text-xs font-sans text-slate-500">{service.service_code || '-'}</TableCell>
                <TableCell className="text-xs font-sans">{service.unit}</TableCell>
                <TableCell className="text-xs font-sans text-right">₹{service.sale_price?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={service.is_active ? "success" : "secondary"} className="text-[10px] uppercase">
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingService(service); setIsDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => { if(confirm('Delete this service?')) mutations.deleteService.mutate(service.id); }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Stack */}
      <div className="md:hidden space-y-3">
        {filteredServices?.map(service => (
          <Card key={service.id} className="overflow-hidden border-slate-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{service.service_name}</h3>
                  <p className="text-xs text-slate-500">{service.service_code || 'No Code'}</p>
                </div>
                <Badge variant={service.is_active ? "success" : "secondary"} className="text-[10px]">
                  {service.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-bold text-blue-600">₹{service.sale_price?.toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingService(service); setIsDialogOpen(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if(confirm('Delete this service?')) mutations.deleteService.mutate(service.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
