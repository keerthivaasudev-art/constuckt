import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });

  const updateClientMutation = useMutation({
    mutationFn: async (updatedClient: Partial<Client>) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      toast.success('Client updated successfully');
      navigate('/clients');
    },
    onError: (error) => {
      toast.error(`Error updating client: ${error.message}`);
    },
  });

  const handleUpdateClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateClientMutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: `${formData.get('address_line_1')}, ${formData.get('city')}, ${formData.get('state')}`,
      gstin: formData.get('gstin') as string,
      category: formData.get('category') as string,
      vendor_no: formData.get('vendor_no') as string,
      address_line_1: formData.get('address_line_1') as string,
      address_line_2: formData.get('address_line_2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pincode: formData.get('pincode') as string,
      contact_person_1_name: formData.get('contact_person_1_name') as string,
      contact_person_1_designation: formData.get('contact_person_1_designation') as string,
      contact_person_1_phone: formData.get('contact_person_1_phone') as string,
      contact_person_1_email: formData.get('contact_person_1_email') as string,
      contact_person_2_name: formData.get('contact_person_2_name') as string,
      contact_person_2_designation: formData.get('contact_person_2_designation') as string,
      contact_person_2_phone: formData.get('contact_person_2_phone') as string,
      contact_person_2_email: formData.get('contact_person_2_email') as string,
      contact_person_3_name: formData.get('contact_person_3_name') as string,
      contact_person_3_designation: formData.get('contact_person_3_designation') as string,
      contact_person_3_phone: formData.get('contact_person_3_phone') as string,
      contact_person_3_email: formData.get('contact_person_3_email') as string,
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading client data...</div>;
  if (!client) return <div className="p-8 text-center">Client not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Client</h1>
          <p className="text-slate-500">Update the details for {client.name}.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleUpdateClient} className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input id="name" name="name" defaultValue={client.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Company Email *</Label>
              <Input id="email" name="email" type="email" defaultValue={client.email} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Company Phone *</Label>
              <Input id="phone" name="phone" defaultValue={client.phone} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={client.category || 'Active'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6 border rounded-lg p-6 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900">Contact Persons</h3>
            
            {/* Contact Person 1 */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Contact Person 1</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Input id="contact_person_1_name" name="contact_person_1_name" defaultValue={client.contact_person_1_name} placeholder="Name" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_1_designation" name="contact_person_1_designation" defaultValue={client.contact_person_1_designation} placeholder="e.g. Manager" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_1_phone" name="contact_person_1_phone" defaultValue={client.contact_person_1_phone} placeholder="Phone" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_1_email" name="contact_person_1_email" type="email" defaultValue={client.contact_person_1_email} placeholder="email@example.com" />
                </div>
              </div>
            </div>

            {/* Contact Person 2 */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Contact Person 2</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Input id="contact_person_2_name" name="contact_person_2_name" defaultValue={client.contact_person_2_name} placeholder="Contact Person 2" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_2_designation" name="contact_person_2_designation" defaultValue={client.contact_person_2_designation} placeholder="Designation" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_2_phone" name="contact_person_2_phone" defaultValue={client.contact_person_2_phone} placeholder="Phone" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_2_email" name="contact_person_2_email" type="email" defaultValue={client.contact_person_2_email} placeholder="Email" />
                </div>
              </div>
            </div>

            {/* Contact Person 3 */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Contact Person 3</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Input id="contact_person_3_name" name="contact_person_3_name" defaultValue={client.contact_person_3_name} placeholder="Contact Person 3" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_3_designation" name="contact_person_3_designation" defaultValue={client.contact_person_3_designation} placeholder="Designation" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_3_phone" name="contact_person_3_phone" defaultValue={client.contact_person_3_phone} placeholder="Phone" />
                </div>
                <div className="space-y-1">
                  <Input id="contact_person_3_email" name="contact_person_3_email" type="email" defaultValue={client.contact_person_3_email} placeholder="Email" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gstin">GST IN</Label>
              <Input id="gstin" name="gstin" defaultValue={client.gstin} placeholder="15 characters (e.g., 27AABCU9603R1ZM)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_no">Vendor No</Label>
              <Input id="vendor_no" name="vendor_no" defaultValue={client.vendor_no} placeholder="Vendor No" />
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-6 bg-emerald-50/20 border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-900">Billing Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input id="address_line_1" name="address_line_1" defaultValue={client.address_line_1} placeholder="Address Line 1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input id="address_line_2" name="address_line_2" defaultValue={client.address_line_2} placeholder="Address Line 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select name="state" defaultValue={client.state}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={client.city} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" defaultValue={client.pincode} placeholder="Pincode" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateClientMutation.isPending}>
              {updateClientMutation.isPending ? 'Updating...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
