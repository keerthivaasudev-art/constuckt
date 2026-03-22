import React, { useState, useEffect } from 'react';
import { 
  supabase, 
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
  RefreshCw,
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMaterialsData } from '../hooks/useMaterials';
import { useQuery } from '@tanstack/react-query';

export function MaterialList() {
  const { queries, mutations } = useMaterialsData();
  const { data: materials, isLoading } = queries.materials;
  const { data: categories } = queries.categories;
  const { data: units } = queries.units;
  const { data: companyVariants } = queries.variants;

  const [searchTerm, setSearchTerm] = useState('');
  const [hideInactive, setHideInactive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [usesVariant, setUsesVariant] = useState(false);
  const [variantPricingRows, setVariantPricingRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['Name', 'Code', 'Category', 'Unit', 'Variants', 'Price', 'Status']);
  
  const itemColumns = ['Name', 'Display Name', 'Item Code', 'Category', 'Sub Category', 'Unit', 'Sale Price', 'Purchase Price', 'GST Rate', 'HSN Code', 'Size', 'Pressure Class', 'Schedule Type', 'Material', 'End Connection', 'Variants', 'Status'];

  const { data: variantPricing } = useQuery({
    queryKey: ['variant-pricing', editingMaterial?.id],
    queryFn: async () => {
      if (!editingMaterial?.id) return [];
      const { data, error } = await supabase
        .from('item_variant_pricing')
        .select('*')
        .eq('item_id', editingMaterial.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!editingMaterial?.id && editingMaterial.uses_variant,
  });

  useEffect(() => {
    if (variantPricing) {
      setVariantPricingRows(variantPricing);
    } else if (!editingMaterial) {
      setVariantPricingRows([]);
    }
  }, [variantPricing, editingMaterial]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const materialData = {
      name: data.name,
      display_name: data.display_name,
      item_code: data.item_code || null,
      category: data.category,
      sub_category: data.sub_category,
      unit: data.unit,
      sale_price: parseFloat(data.sale_price as string) || 0,
      purchase_price: parseFloat(data.purchase_price as string) || 0,
      gst_rate: parseFloat(data.gst_rate as string) || 0,
      hsn_code: data.hsn_code,
      size: data.size,
      pressure_class: data.pressure_class,
      schedule_type: data.schedule_type,
      material: data.material,
      end_connection: data.end_connection,
      uses_variant: usesVariant,
      stock: editingMaterial?.stock || 0,
      status: editingMaterial?.status || 'active',
      is_active: true,
      variantPricing: usesVariant ? variantPricingRows : []
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] h-11 md:h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-slate-600 hidden md:flex">
                <Columns className="w-4 h-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
              {itemColumns.map((col) => (
                <DropdownMenuItem key={col} onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={visibleColumns.includes(col)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setVisibleColumns([...visibleColumns, col]);
                        } else {
                          setVisibleColumns(visibleColumns.filter(c => c !== col));
                        }
                      }}
                    />
                    {col}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingMaterial(null);
              setUsesVariant(false);
              setVariantPricingRows([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9 flex-1 md:flex-none">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="w-screen h-screen max-w-none sm:max-w-none m-0 rounded-none overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMaterial ? 'Edit' : 'Add New'} Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input id="name" name="name" defaultValue={editingMaterial?.name || ''} placeholder="e.g. Gate Valve" required className="h-11 md:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input id="display_name" name="display_name" defaultValue={editingMaterial?.display_name || ''} placeholder="e.g. GV-2024" className="h-11 md:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_code">Item Code</Label>
                    <Input id="item_code" name="item_code" defaultValue={editingMaterial?.item_code || ''} placeholder="e.g. CODE-001" className="h-11 md:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select defaultValue={editingMaterial?.category || ''} name="category" required>
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
                    <Select defaultValue={editingMaterial?.unit || ''} name="unit" required>
                      <SelectTrigger className="h-11 md:h-9">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units?.map(u => (
                          <SelectItem key={u.id} value={u.unit_code}>{u.unit_name} ({u.unit_code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price</Label>
                    <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={editingMaterial?.sale_price || 0} className="h-11 md:h-9" />
                  </div>
                </div>
                {/* Variant section could go here if needed, keeping it simple for now */}
                <DialogFooter className="sticky bottom-0 bg-white p-4 border-t">
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
              {visibleColumns.includes('Name') && <TableHead className="text-xs font-semibold uppercase font-sans">Name</TableHead>}
              {visibleColumns.includes('Code') && <TableHead className="text-xs font-semibold uppercase font-sans">Code</TableHead>}
              {visibleColumns.includes('Category') && <TableHead className="text-xs font-semibold uppercase font-sans">Category</TableHead>}
              {visibleColumns.includes('Unit') && <TableHead className="text-xs font-semibold uppercase font-sans">Unit</TableHead>}
              {visibleColumns.includes('Price') && <TableHead className="text-xs font-semibold uppercase font-sans text-right">Price</TableHead>}
              {visibleColumns.includes('Status') && <TableHead className="text-xs font-semibold uppercase font-sans">Status</TableHead>}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center py-8 text-slate-500">Loading materials...</TableCell></TableRow>
            ) : filteredMaterials?.length === 0 ? (
              <TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center py-8 text-slate-500">No items found.</TableCell></TableRow>
            ) : filteredMaterials?.map(item => (
              <TableRow key={item.id} className="hover:bg-slate-50/50">
                {visibleColumns.includes('Name') && <TableCell className="text-xs font-sans font-medium">{item.name}</TableCell>}
                {visibleColumns.includes('Code') && <TableCell className="text-xs font-sans text-slate-500">{item.item_code || '-'}</TableCell>}
                {visibleColumns.includes('Category') && <TableCell className="text-xs font-sans">{item.category}</TableCell>}
                {visibleColumns.includes('Unit') && <TableCell className="text-xs font-sans">{item.unit}</TableCell>}
                {visibleColumns.includes('Price') && <TableCell className="text-xs font-sans text-right">₹{item.sale_price?.toLocaleString()}</TableCell>}
                {visibleColumns.includes('Status') && (
                  <TableCell>
                    <Badge variant={item.is_active ? "success" : "secondary"} className="text-[10px] uppercase">
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingMaterial(item); setUsesVariant(item.uses_variant || false); setIsDialogOpen(true); }}>
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
                  <Button variant="ghost" size="sm" onClick={() => { setEditingMaterial(item); setUsesVariant(item.uses_variant || false); setIsDialogOpen(true); }}>
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
