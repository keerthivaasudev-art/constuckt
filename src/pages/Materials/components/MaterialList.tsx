import React, { useState, useEffect } from 'react';
import { 
  Material, 
  ItemCategory, 
  ItemUnit
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Columns, 
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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

export function MaterialList() {
  const { queries, mutations } = useMaterialsData();
  const { data: materials, isLoading } = queries.materials;
  const { data: categories } = queries.categories;
  const { data: units } = queries.units;

  const [searchTerm, setSearchTerm] = useState('');
  const [hideInactive, setHideInactive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['Name', 'Code', 'Category', 'Unit', 'Price', 'Status']);
  
  const itemColumns = ['Name', 'Item Code', 'Category', 'Unit', 'Price', 'Status'];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const materialData = {
      name: data.name,
      display_name: data.display_name,
      item_code: data.item_code || null,
      category: data.category,
      unit: data.unit,
      sale_price: parseFloat(data.sale_price as string) || 0,
      is_active: true,
      stock: editingMaterial?.stock || 0,
    };

    if (editingMaterial) {
      mutations.updateMaterial.mutate({ id: editingMaterial.id, ...materialData }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      mutations.addMaterial.mutate(materialData, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const filteredMaterials = materials?.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (m.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesStatus = !hideInactive || m.is_active;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 md:h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="hide-inactive" 
              checked={hideInactive} 
              onCheckedChange={(checked) => setHideInactive(!!checked)} 
            />
            <Label htmlFor="hide-inactive" className="text-sm cursor-pointer">Hide Inactive</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMaterial(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9 flex-1 md:flex-none">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingMaterial ? 'Edit' : 'Add New'} Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input id="name" name="name" defaultValue={editingMaterial?.name || ''} required className="h-11 md:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_code">Item Code</Label>
                    <Input id="item_code" name="item_code" defaultValue={editingMaterial?.item_code || ''} className="h-11 md:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" defaultValue={editingMaterial?.category}>
                      <SelectTrigger className="h-11 md:h-9">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select name="unit" defaultValue={editingMaterial?.unit}>
                      <SelectTrigger className="h-11 md:h-9">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units?.map(u => (
                          <SelectItem key={u.id} value={u.unit_code}>{u.unit_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price</Label>
                    <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={editingMaterial?.sale_price || 0} className="h-11 md:h-9" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Item</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold uppercase font-sans">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Category</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Unit</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans text-right">Price</TableHead>
              <TableHead className="text-xs font-semibold uppercase font-sans">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading materials...</TableCell></TableRow>
            ) : filteredMaterials?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No items found.</TableCell></TableRow>
            ) : filteredMaterials?.map(item => (
              <TableRow key={item.id} className="hover:bg-slate-50/50">
                <TableCell className="text-xs font-sans font-medium">{item.name}</TableCell>
                <TableCell className="text-xs font-sans text-slate-500">{item.item_code || '-'}</TableCell>
                <TableCell className="text-xs font-sans">{item.category}</TableCell>
                <TableCell className="text-xs font-sans">{item.unit}</TableCell>
                <TableCell className="text-xs font-sans text-right">₹{item.sale_price?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? "success" : "secondary"} className="text-[10px] uppercase">
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingMaterial(item); setIsDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => { if(confirm('Delete this item?')) mutations.deleteMaterial.mutate(item.id); }}>
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
        {filteredMaterials?.map(item => (
          <Card key={item.id} className="overflow-hidden border-slate-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.item_code || 'No Code'} • {item.category}</p>
                </div>
                <Badge variant={item.is_active ? "success" : "secondary"} className="text-[10px]">
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-bold text-blue-600">₹{item.sale_price?.toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingMaterial(item); setIsDialogOpen(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { if(confirm('Delete this item?')) mutations.deleteMaterial.mutate(item.id); }}>
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
