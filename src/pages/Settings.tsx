import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, DiscountPriceList } from '@/lib/supabase';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

type SettingsTab = 'general' | 'print' | 'document' | 'template' | 'organisation' | 'discount';
type DiscountSubTab = 'standard' | 'premium' | 'bulk' | 'special';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('discount');
  const [discountSubTab, setDiscountSubTab] = useState<DiscountSubTab>('standard');
  const queryClient = useQueryClient();

  const { data: priceLists, isLoading: isLoadingPriceLists } = useQuery({
    queryKey: ['discount-price-lists', discountSubTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_price_lists')
        .select('*')
        .eq('type', discountSubTab)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as DiscountPriceList[];
    },
  });

  const addPriceListMutation = useMutation({
    mutationFn: async (newList: Omit<DiscountPriceList, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('discount_price_lists')
        .insert([newList])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-price-lists', discountSubTab] });
      toast.success('Price list added successfully');
    },
    onError: (error) => {
      toast.error(`Error adding price list: ${error.message}`);
    },
  });

  const deletePriceListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discount_price_lists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-price-lists', discountSubTab] });
      toast.success('Price list deleted');
    },
  });

  const handleAddPriceList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const discount = parseFloat(formData.get('discount') as string);

    if (!name || isNaN(discount)) return;

    addPriceListMutation.mutate({
      name,
      discount_percent: discount,
      type: discountSubTab
    });
    e.currentTarget.reset();
  };

  const menuItems = [
    { id: 'general', label: 'General' },
    { id: 'print', label: 'Print Settings' },
    { id: 'document', label: 'Document Settings' },
    { id: 'template', label: 'Template Settings' },
    { id: 'organisation', label: 'Organisation Settings' },
    { id: 'discount', label: 'Discount Settings' },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {activeTab === 'discount' ? (
          <div className="space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Discount Settings</h1>
                <p className="text-slate-500 text-sm">Configure discount pricelists and rules.</p>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/50 rounded-lg w-fit">
              {(['standard', 'premium', 'bulk', 'special'] as DiscountSubTab[]).map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setDiscountSubTab(tab)}
                  className={cn(
                    "px-6 py-2 text-sm font-semibold rounded-md transition-all",
                    discountSubTab === tab 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {idx + 1}. {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Add New Price List Form */}
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Add New {discountSubTab.charAt(0).toUpperCase() + discountSubTab.slice(1)} Price List</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPriceList} className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="name" className="text-slate-600 font-medium">Price List Name</Label>
                    <Input id="name" name="name" placeholder={`e.g. ${discountSubTab.charAt(0).toUpperCase() + discountSubTab.slice(1)} 2024`} className="bg-white" required />
                  </div>
                  <div className="w-48 space-y-2">
                    <Label htmlFor="discount" className="text-slate-600 font-medium">Discount %</Label>
                    <Input id="discount" name="discount" type="number" step="0.01" placeholder="0.00" className="bg-white" required />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8" disabled={addPriceListMutation.isPending}>
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Price Lists Table */}
            <Card className="border-slate-200 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{discountSubTab.charAt(0).toUpperCase() + discountSubTab.slice(1)} Price Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-3 text-left">Price List Name</th>
                        <th className="px-6 py-3 text-left w-48">Discount %</th>
                        <th className="px-6 py-3 text-right w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingPriceLists ? (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                      ) : priceLists?.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No price lists found.</td></tr>
                      ) : (
                        priceLists?.map((list) => (
                          <tr key={list.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <Input defaultValue={list.name} className="h-9 bg-white border-slate-200" />
                            </td>
                            <td className="px-6 py-4">
                              <Input defaultValue={list.discount_percent} type="number" step="0.01" className="h-9 bg-white border-slate-200" />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => deletePriceListMutation.mutate(list.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{menuItems.find(i => i.id === activeTab)?.label}</h1>
              <p className="text-slate-500 text-sm">Configure your {activeTab} preferences.</p>
            </div>
            
            {activeTab === 'general' && (
              <div className="grid gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Admin" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="User" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="admin@constructflow.com" />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage how you receive updates.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive daily summaries of site visits.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Project Updates</Label>
                        <p className="text-sm text-slate-500">Get notified when a project status changes.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'organisation' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Organisation Settings</h1>
                  <p className="text-slate-500 text-sm">Manage your company details and branding.</p>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name</Label>
                      <Input id="name" defaultValue="ConstructFlow" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input id="address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <select id="state" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select State</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchAddress">Additional Branch Address</Label>
                      <Input id="branchAddress" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pan">PAN Number</Label>
                        <Input id="pan" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tan">TAN Number</Label>
                        <Input id="tan" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo">Upload Logo</Label>
                      <Input 
                        id="logo" 
                        type="file" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const fileExt = file.name.split('.').pop();
                          const fileName = `logo_${Date.now()}.${fileExt}`;
                          
                          const { data, error } = await supabase.storage
                            .from('organisation-logos')
                            .upload(fileName, file);
                            
                          if (error) {
                            toast.error('Error uploading logo: ' + error.message);
                            return;
                          }
                          
                          const { data: urlData } = supabase.storage
                            .from('organisation-logos')
                            .getPublicUrl(fileName);
                            
                          toast.success('Logo uploaded successfully');
                          // You would typically update the organisation record here
                          console.log('Logo URL:', urlData.publicUrl);
                        }}
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab !== 'general' && activeTab !== 'organisation' && (
              <div className="flex items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                {menuItems.find(i => i.id === activeTab)?.label} configuration coming soon.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
