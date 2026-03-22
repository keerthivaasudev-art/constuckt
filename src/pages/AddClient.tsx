import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Client } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, MapPin, Building2, Contact } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export function AddClient() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const orgId = user?.profile?.organisation_id;

  const addClientMutation = useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'created_at'>) => {
      if (!orgId) throw new Error("Organisation ID missing");
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...newClient, organisation_id: orgId }])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully');
      navigate('/clients');
    },
    onError: (error: any) => {
      toast.error(`Error adding client: ${error.message}`);
    },
  });

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    addClientMutation.mutate({
      name: data.name as string,
      email: data.email as string,
      phone: data.phone as string,
      address: data.address_line_1 as string, // Fallback for general address
      address_line_1: data.address_line_1 as string,
      address_line_2: data.address_line_2 as string,
      city: data.city as string,
      state: data.state as string,
      pincode: data.pincode as string,
      gstin: data.gstin as string || undefined,
      category: data.category as string || 'Standard',
      vendor_no: data.vendor_no as string || undefined,
      
      // Contact Person 1
      contact_person_1_name: data.cp1_name as string,
      contact_person_1_designation: data.cp1_designation as string,
      contact_person_1_phone: data.cp1_phone as string,
      contact_person_1_email: data.cp1_email as string,
      
      // Contact Person 2
      contact_person_2_name: data.cp2_name as string,
      contact_person_2_designation: data.cp2_designation as string,
      contact_person_2_phone: data.cp2_phone as string,
      contact_person_2_email: data.cp2_email as string,
      
      // Contact Person 3
      contact_person_3_name: data.cp3_name as string,
      contact_person_3_designation: data.cp3_designation as string,
      contact_person_3_phone: data.cp3_phone as string,
      contact_person_3_email: data.cp3_email as string,
      
      status: 'Active',
      organisation_id: orgId as string,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Client</h1>
            <p className="text-sm text-slate-500 text-slate-500">Register a new company or individual client</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddClient}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-slate-100 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="basic" className="gap-2">
              <Building2 className="w-4 h-4" /> Basic Details
            </TabsTrigger>
            <TabsTrigger value="address" className="gap-2">
              <MapPin className="w-4 h-4" /> Address & Tax
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Contact className="w-4 h-4" /> Contact Persons
            </TabsTrigger>
          </TabsList>

          {/* Basic Details */}
          <TabsContent value="basic">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Client / Company Name *</Label>
                  <Input id="name" name="name" placeholder="e.g. Acme Corporation" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_no">Vendor No. / Internal Code</Label>
                  <Input id="vendor_no" name="vendor_no" placeholder="e.g. VEND-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Company Email</Label>
                  <Input id="email" name="email" type="email" placeholder="e.g. contact@acme.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Company Phone</Label>
                  <Input id="phone" name="phone" placeholder="e.g. +91 98765 43210" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Client Category</Label>
                  <Select name="category" defaultValue="Standard">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Address & Tax */}
          <TabsContent value="address">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line_1">Address Line 1 *</Label>
                  <Input id="address_line_1" name="address_line_1" placeholder="Building, Street name" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line_2">Address Line 2</Label>
                  <Input id="address_line_2" name="address_line_2" placeholder="Area, Landmark" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" placeholder="e.g. Mumbai" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" name="pincode" placeholder="e.g. 400001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select name="state" defaultValue="Maharashtra">
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" name="gstin" placeholder="e.g. 22AAAAA0000A1Z5" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Contact Persons */}
          <TabsContent value="contacts" className="space-y-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  Contact Person {num} {num === 1 && '(Primary)'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`cp${num}_name`}>Full Name</Label>
                    <Input id={`cp${num}_name`} name={`cp${num}_name`} placeholder="e.g. John Doe" required={num === 1} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cp${num}_designation`}>Designation</Label>
                    <Input id={`cp${num}_designation`} name={`cp${num}_designation`} placeholder="e.g. Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cp${num}_phone`}>Phone Number</Label>
                    <Input id={`cp${num}_phone`} name={`cp${num}_phone`} placeholder="e.g. 9876543210" required={num === 1} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cp${num}_email`}>Email</Label>
                    <Input id={`cp${num}_email`} name={`cp${num}_email`} type="email" placeholder="e.g. john@acme.com" />
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 z-10 lg:pl-72">
          <div className="max-w-5xl mx-auto flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/clients')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" disabled={addClientMutation.isPending}>
              {addClientMutation.isPending ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
