import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ClientCall } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function CommunicationDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Client Calls
  const { data: calls, isLoading } = useQuery({
    queryKey: ['client-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_calls')
        .select('*')
        .order('call_date', { ascending: false });
      
      if (error) throw error;
      return data as ClientCall[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_calls')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-calls'] });
      toast.success('Call log deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting log: ${error.message}`);
    },
  });

  const filteredCalls = calls?.filter(c => 
    c.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto w-full bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Client Call Logs</h3>
        <Button onClick={() => navigate('/communication/add')}>
          <Plus className="w-4 h-4 mr-2" /> New Log
        </Button>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search logs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredCalls?.map((call) => (
              <TableRow key={call.id}>
                <TableCell>{call.call_date}</TableCell>
                <TableCell>{call.client_id}</TableCell>
                <TableCell>{call.call_category}</TableCell>
                <TableCell className="max-w-xs truncate">{call.notes}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/communication/edit/${call.id}`)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(call.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
