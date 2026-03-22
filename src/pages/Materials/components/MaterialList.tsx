import React, { useState, useEffect } from 'react';
import { 
  supabase,
  Material, 
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
  Trash2,
  IndianRupee,
  FileText,
  Settings,
  Layers,
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
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
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
  
  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['Item Detail', 'Category & Unit', 'Price', 'Tax', 'Features', 'Status']);
  
  const allColumns = [
    { id: 'Item Detail', label: 'Item Detail' },
    { id: 'Category & Unit', label: 'Category & Unit' },
    { id: 'Price', label: 'Selling Price' },
    { id: 'Tax', label: 'Tax Details' },
    { id: 'Features', label: 'Features' },
    { id: 'Status', label: 'Status' }
  ];

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId) 
        : [...prev, columnId]
    );
  };

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
      name: data.name as string,
      display_name: data.display_name as string,
      item_code: data.item_code as string || null,
      category: data.category as string,
      sub_category: data.sub_category as string,
      unit: data.unit as string,
      sale_price: parseFloat(data.sale_price as string) || 0,
      purchase_price: parseFloat(data.purchase_price as string) || 0,
      gst_rate: parseFloat(data.gst_rate as string) || 0,
      hsn_code: data.hsn_code as string,
      size: data.size as string,
      pressure_class: data.pressure_class as string,
      schedule_type: data.schedule_type as string,
      material: data.material as string,
      end_connection: data.end_connection as string,
      uses_variant: usesVariant,
      is_active: true,
      stock: editingMaterial?.stock || 0,
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
          {/* Columns Button Restored */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-slate-600 hidden md:flex h-9">
                <Columns className="w-4 h-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allColumns.map((col) => (
                <div 
                  key={col.id} 
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-50 rounded-sm"
                  onClick={() => toggleColumn(col.id)}
                >
                  <Checkbox checked={visibleColumns.includes(col.id)} />
                  <span className="text-sm">{col.label}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9 flex-1 md:flex-none font-semibold shadow-lg shadow-blue-600/20"
            onClick={() => {
              setEditingMaterial(null);
              setUsesVariant(false);
              setVariantPricingRows([]);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add New Item
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold">{editingMaterial ? 'Edit' : 'Add New'} Inventory Item</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                <form id="material-form" onSubmit={handleSubmit} className="py-4">
                  <div className="space-y-10">
                    {/* General Info Section */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                        <div className="space-y-2">
                          <Label htmlFor="name">Item Name *</Label>
                          <Input id="name" name="name" defaultValue={editingMaterial?.name || ''} placeholder="e.g. Gate Valve" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="display_name">Display Name (Internal)</Label>
                          <Input id="display_name" name="display_name" defaultValue={editingMaterial?.display_name || ''} placeholder="e.g. GV-2024-Red" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item_code">Part Number / Code</Label>
                          <Input id="item_code" name="item_code" defaultValue={editingMaterial?.item_code || ''} placeholder="e.g. ITEM-001" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Primary Category *</Label>
                          <Select name="category" defaultValue={editingMaterial?.category}>
                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                              {categories?.map(cat => (
                                <SelectItem key={cat.id} value={cat.category_name}>{cat.category_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sub_category">Sub-Category</Label>
                          <Input id="sub_category" name="sub_category" defaultValue={editingMaterial?.sub_category || ''} placeholder="e.g. Industrial Valves" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit">Base Unit of Measure *</Label>
                          <Select name="unit" defaultValue={editingMaterial?.unit}>
                            <SelectTrigger><SelectValue placeholder="Select Unit" /></SelectTrigger>
                            <SelectContent>
                              {units?.map(u => (
                                <SelectItem key={u.id} value={u.unit_code}>{u.unit_name} ({u.unit_code})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </section>

                    {/* Pricing Section */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <IndianRupee className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Pricing & Tax Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-emerald-50/20 p-6 rounded-xl border border-emerald-100/50">
                        <div className="space-y-2">
                          <Label htmlFor="sale_price">Standard Sale Price (₹)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input id="sale_price" name="sale_price" type="number" step="0.01" defaultValue={editingMaterial?.sale_price || 0} className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purchase_price">Standard Purchase Price (₹)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input id="purchase_price" name="purchase_price" type="number" step="0.01" defaultValue={editingMaterial?.purchase_price || 0} className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gst_rate">GST Rate (%)</Label>
                          <Select name="gst_rate" defaultValue={editingMaterial?.gst_rate?.toString() || "18"}>
                            <SelectTrigger><SelectValue placeholder="Tax %" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0% (Exempt)</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hsn_code">HSN / SAC Code</Label>
                          <Input id="hsn_code" name="hsn_code" defaultValue={editingMaterial?.hsn_code || ''} placeholder="e.g. 8481" />
                        </div>
                      </div>
                    </section>

                    {/* Specs Section */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Settings className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                        <div className="space-y-2">
                          <Label htmlFor="size">Size / Dimensions</Label>
                          <Input id="size" name="size" defaultValue={editingMaterial?.size || ''} placeholder="e.g. 2 inch" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pressure_class">Pressure Class</Label>
                          <Input id="pressure_class" name="pressure_class" defaultValue={editingMaterial?.pressure_class || ''} placeholder="e.g. Class 150" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule_type">Schedule Type</Label>
                          <Input id="schedule_type" name="schedule_type" defaultValue={editingMaterial?.schedule_type || ''} placeholder="e.g. SCH 40" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="material">Body Material</Label>
                          <Input id="material" name="material" defaultValue={editingMaterial?.material || ''} placeholder="e.g. Stainless Steel" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_connection">End Connection</Label>
                          <Input id="end_connection" name="end_connection" defaultValue={editingMaterial?.end_connection || ''} placeholder="e.g. Flanged" />
                        </div>
                      </div>
                    </section>

                    {/* Variants Section */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Layers className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Inventory Variants</h3>
                      </div>
                      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold">Enable Variants</Label>
                            <p className="text-sm text-slate-500">Allow multiple makes (e.g. Jindal, Tata) for this item with custom pricing.</p>
                          </div>
                          <Checkbox 
                            checked={usesVariant} 
                            onCheckedChange={(checked) => {
                              setUsesVariant(!!checked);
                              if (checked && variantPricingRows.length === 0) {
                                setVariantPricingRows(companyVariants?.map(v => ({
                                  company_variant_id: v.id,
                                  variant_name: v.variant_name,
                                  make: '',
                                  sale_price: editingMaterial?.sale_price || 0,
                                  purchase_price: editingMaterial?.purchase_price || 0
                                })) || []);
                              }
                            }} 
                          />
                        </div>

                        {usesVariant && (
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            {variantPricingRows.map((row, idx) => (
                              <div key={row.company_variant_id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg items-end border border-slate-100">
                                <div className="space-y-1">
                                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Make / Brand</Label>
                                  <Input 
                                    placeholder="e.g. Jindal"
                                    value={row.make || ''}
                                    onChange={(e) => {
                                      const newRows = [...variantPricingRows];
                                      newRows[idx].make = e.target.value;
                                      setVariantPricingRows(newRows);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Sale Price (₹)</Label>
                                  <Input 
                                    type="number"
                                    value={row.sale_price || 0}
                                    onChange={(e) => {
                                      const newRows = [...variantPricingRows];
                                      newRows[idx].sale_price = parseFloat(e.target.value);
                                      setVariantPricingRows(newRows);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Purchase Price (₹)</Label>
                                  <Input 
                                    type="number"
                                    value={row.purchase_price || 0}
                                    onChange={(e) => {
                                      const newRows = [...variantPricingRows];
                                      newRows[idx].purchase_price = parseFloat(e.target.value);
                                      setVariantPricingRows(newRows);
                                    }}
                                  />
                                </div>
                                <div className="flex items-center h-10 px-2 text-xs font-bold text-blue-600 bg-blue-50 rounded border border-blue-100">
                                  {row.variant_name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </form>
              </div>

              <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50 rounded-b-lg">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Discard Changes</Button>
                <Button 
                  form="material-form"
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 min-w-[140px] font-bold" 
                  disabled={mutations.addMaterial.isPending || mutations.updateMaterial.isPending}
                >
                  {editingMaterial ? 'Update Inventory' : 'Add to Inventory'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Desktop Table with Conditional Columns */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              {visibleColumns.includes('Item Detail') && <TableHead className="font-bold text-slate-900">Item Detail</TableHead>}
              {visibleColumns.includes('Category & Unit') && <TableHead className="font-bold text-slate-900">Category & Unit</TableHead>}
              {visibleColumns.includes('Price') && <TableHead className="font-bold text-slate-900 text-right">Selling Price</TableHead>}
              {visibleColumns.includes('Tax') && <TableHead className="font-bold text-slate-900">Tax Detail</TableHead>}
              {visibleColumns.includes('Features') && <TableHead className="font-bold text-slate-900">Features</TableHead>}
              {visibleColumns.includes('Status') && <TableHead className="font-bold text-slate-900">Status</TableHead>}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-slate-500">Fetching inventory items...</TableCell></TableRow>
            ) : filteredMaterials?.length === 0 ? (
              <TableRow><TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-slate-500">No items found matching your search.</TableCell></TableRow>
            ) : filteredMaterials?.map(item => (
              <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {visibleColumns.includes('Item Detail') && (
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{item.item_code || 'No Code'}</p>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('Category & Unit') && (
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="w-fit text-[10px]">{item.category}</Badge>
                      <span className="text-xs text-slate-500">{item.unit}</span>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('Price') && (
                  <TableCell className="text-right font-bold text-blue-700">
                    ₹{item.sale_price?.toLocaleString()}
                  </TableCell>
                )}
                {visibleColumns.includes('Tax') && (
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-700">{item.gst_rate}% GST</p>
                      <p className="text-[10px] text-slate-400">HSN: {item.hsn_code || 'N/A'}</p>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('Features') && (
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {item.uses_variant && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] uppercase font-bold px-1.5">Multi-Variant</Badge>}
                      {item.size && <Badge variant="outline" className="text-[9px] px-1.5">{item.size}</Badge>}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('Status') && (
                  <TableCell>
                    {item.is_active ? 
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] uppercase px-1.5">Live</Badge> : 
                      <Badge variant="destructive" className="text-[9px] uppercase px-1.5">Inactive</Badge>
                    }
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => { setEditingMaterial(item); setUsesVariant(item.uses_variant || false); setIsDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Item
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => { if(confirm('Are you sure you want to delete this item?')) mutations.deleteMaterial.mutate(item.id); }}>
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
          <Card key={item.id} className="overflow-hidden border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">{item.item_code || 'No Code'} • {item.category}</p>
                </div>
                <Badge className={item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"} variant="secondary" className="text-[9px] uppercase font-bold">
                  {item.is_active ? 'Live' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Price per {item.unit}</span>
                  <span className="text-base font-bold text-blue-600 leading-none block mt-1">₹{item.sale_price?.toLocaleString()}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-9 p-0 px-2" onClick={() => { setEditingMaterial(item); setUsesVariant(item.uses_variant || false); setIsDialogOpen(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 p-0 px-2 text-red-600" onClick={() => { if(confirm('Delete this item?')) mutations.deleteMaterial.mutate(item.id); }}>
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
