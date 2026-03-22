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
import { useAuth } from '@/contexts/AuthContext';

type SettingsTab = 'general' | 'print' | 'document' | 'template' | 'organisation' | 'discount';
type DiscountSubTab = 'standard' | 'premium' | 'bulk' | 'special';

export function Settings() {
  const { user } = useAuth();
  const orgId = user?.profile?.organisation_id;
  const [activeTab, setActiveTab] = useState<SettingsTab>('discount');
  const [discountSubTab, setDiscountSubTab] = useState<DiscountSubTab>('standard');
  const queryClient = useQueryClient();

  const { data: priceLists, isLoading: isLoadingPriceLists } = useQuery({
    queryKey: ['discount-price-lists', discountSubTab, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_price_lists')
        .select('*')
        .eq('organisation_id', orgId)
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
    onError: (error: any) => {
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
    if (!orgId) {
      toast.error('Organisation ID not found');
      return;
    }
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const discount = parseFloat(formData.get('discount') as string);

    if (!name || isNaN(discount)) return;

    addPriceListMutation.mutate({
      organisation_id: orgId,
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
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'discount' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Discount & Pricing Lists</h3>
                <p className="text-sm text-slate-500">Manage your predefined discount categories.</p>
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                {(['standard', 'premium', 'bulk', 'special'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDiscountSubTab(tab)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all",
                      discountSubTab === tab
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New {discountSubTab} List</CardTitle>
                  <CardDescription>Create a new price category for this segment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPriceList} className="flex items-end gap-4">
                    <div className="grid gap-2 flex-1">
                      <Label htmlFor="name">List Name</Label>
                      <Input id="name" name="name" placeholder="e.g. Q1 Special" required />
                    </div>
                    <div className="grid gap-2 w-32">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input id="discount" name="discount" type="number" step="0.1" placeholder="5.0" required />
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={addPriceListMutation.isPending}>
                      {addPriceListMutation.isPending ? 'Adding...' : 'Add List'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingPriceLists ? (
                  <div className="col-span-full py-12 text-center text-slate-500">Loading price lists...</div>
                ) : priceLists?.map((list) => (
                  <Card key={list.id} className="hover:border-blue-200 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{list.name}</p>
                        <p className="text-sm font-medium text-blue-600">{list.discount_percent}% Discount</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-600"
                        onClick={() => deletePriceListMutation.mutate(list.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {!isLoadingPriceLists && priceLists?.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white border border-dashed rounded-xl text-slate-400">
                    No {discountSubTab} price lists found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'discount' && (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-xl bg-white space-y-4">
              <div className="p-3 bg-slate-50 rounded-full">
                <Settings className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-900">Settings Section Locked</p>
                <p className="text-sm text-slate-500">This module ({activeTab}) is coming in the next update.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
