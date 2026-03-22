import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Client } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Clients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['client-counts', selectedClientId],
    enabled: !!selectedClientId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => {
      const [
        { count: qCount },
        { count: poCount },
        { count: pCount },
        { count: svCount },
        { count: dcCount },
        { count: mCount }
      ] = await Promise.all([
        supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId),
        supabase.from('site_visits').select('*', { count: 'exact', head: true }).eq('project_id', selectedClientId),
        supabase.from('delivery_challans').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId),
        supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId),
      ]);

      return {
        quotations: qCount || 0,
        pos: poCount || 0,
        projects: pCount || 0,
        siteVisits: svCount || 0,
        challans: dcCount || 0,
        meetings: mCount || 0,
      };
    },
  });

  useEffect(() => {
    if (clients && clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.gstin && client.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const selectedClient = clients?.find(c => c.id === selectedClientId);

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 overflow-hidden bg-slate-50">
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Clients</h2>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 gap-1"
              onClick={() => navigate('/clients/add')}
            >
              <Plus className="w-4 h-4" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search client..." 
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : filteredClients?.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No clients found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients?.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={cn(
                    "w-full text-left p-4 transition-colors hover:bg-slate-50",
                    selectedClientId === client.id && "bg-blue-50 border-l-4 border-blue-600"
                  )}
                >
                  <div className="font-semibold text-slate-900 truncate">{client.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {client.id.slice(0, 8).toUpperCase()} | {client.vendor_no || '-'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Detail View */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedClient ? (
          <>
            <div className="p-6 border-bottom border-slate-200 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h1>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => navigate(`/clients/edit/${selectedClient.id}`)}
              >
                <Edit2 className="w-4 h-4" /> Edit
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1 h-auto flex-wrap justify-start gap-1 border-none">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 rounded-md">Overview</TabsTrigger>
                  <TabsTrigger value="ledger" className="px-4 py-2 rounded-md">Ledger Statement</TabsTrigger>
                  <TabsTrigger value="transactions" className="px-4 py-2 rounded-md">Transactions</TabsTrigger>
                  <TabsTrigger value="quotations" className="px-4 py-2 rounded-md">Quotations ({counts?.quotations || 0})</TabsTrigger>
                  <TabsTrigger value="po" className="px-4 py-2 rounded-md">Client PO ({counts?.pos || 0})</TabsTrigger>
                  <TabsTrigger value="projects" className="px-4 py-2 rounded-md">Projects ({counts?.projects || 0})</TabsTrigger>
                  <TabsTrigger value="site-visits" className="px-4 py-2 rounded-md">Site Visits ({counts?.siteVisits || 0})</TabsTrigger>
                  <TabsTrigger value="challans" className="px-4 py-2 rounded-md">Delivery Challans ({counts?.challans || 0})</TabsTrigger>
                  <TabsTrigger value="meetings" className="px-4 py-2 rounded-md">Meetings ({counts?.meetings || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoCard label="Client ID" value={selectedClient.id.slice(0, 8).toUpperCase()} />
                    <InfoCard label="Contact" value={selectedClient.contact_person_1_name || '-'} />
                    <InfoCard label="Email" value={selectedClient.contact_person_1_email || '-'} />
                    <InfoCard label="GSTIN" value={selectedClient.gstin || '-'} />
                    <InfoCard label="State" value={selectedClient.state || '-'} />
                    <InfoCard label="City" value={selectedClient.city || '-'} />
                    <InfoCard label="Category" value={selectedClient.category || 'Active'} />
                    <InfoCard label="Address" value={selectedClient.pincode || '-'} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a client to view details
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-1">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
