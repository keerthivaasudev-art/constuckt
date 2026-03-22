import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ClientCall } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MoreVertical, Save, Edit, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function CommunicationAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    client_id: '',
    call_date: new Date().toISOString().split('T')[0],
    call_category: 'General Inquiry',
    notes: '',
    received_by_staff_id: '1',
    entered_by_staff_id: '2',
    assigned_to_team_id: '1',
    required_action: 'no action',
    required_action_details: ''
  });

  const { data: call } = useQuery({
    queryKey: ['client-call', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_calls')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ClientCall;
    },
    enabled: isEdit,
  });

  // Mock data fetching - replace with actual Supabase queries when tables are available
  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => [
      { id: '1', name: 'Alexander Pierce' },
      { id: '2', name: 'Elena Rodriguez' },
      { id: '3', name: 'James Doe' }
    ],
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => [
      { id: '1', name: 'Creative Team A' },
      { id: '2', name: 'Technical Team B' }
    ],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('id, name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (call) {
      setFormData({
        client_id: call.client_id,
        call_date: call.call_date,
        call_category: call.call_category,
        notes: call.notes,
        received_by_staff_id: call.received_by_staff_id,
        entered_by_staff_id: call.entered_by_staff_id,
        assigned_to_team_id: call.assigned_to_team_id,
        required_action: call.required_action,
        required_action_details: call.required_action_details || ''
      });
    }
  }, [call]);

  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState(['General Inquiry', 'Technical Support', 'Billing Question', 'Urgent Resolution']);
  const actions = ['no action', 'call', 'decision to be taken', 'others (manual edit)'];

  const saveMutation = useMutation({
    mutationFn: async (callData: any) => {
      if (isEdit) {
        const { data, error } = await supabase
          .from('client_calls')
          .update(callData)
          .eq('id', id)
          .select();
        if (error) throw error;
        return data[0];
      } else {
        const { data, error } = await supabase
          .from('client_calls')
          .insert([callData])
          .select();
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-calls'] });
      toast.success(`Call log ${isEdit ? 'updated' : 'saved'} successfully`);
      navigate('/communication');
    },
    onError: (error: any) => {
      toast.error(`Error ${isEdit ? 'updating' : 'saving'} log: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Client Call Logs</h3>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-8 space-y-6">
          <div className="bg-white rounded-xl p-6 space-y-6 border border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <span className="text-indigo-600">👤</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Client Identity</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Client Name</Label>
                <div className="flex gap-2">
                  <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                    <SelectTrigger className="flex-grow"><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">Add Client</Button>
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.call_date} onChange={(e) => setFormData({...formData, call_date: e.target.value})} />
              </div>
              <div>
                <Label>Call Category</Label>
                <div className="flex gap-2">
                  <Select value={formData.call_category} onValueChange={(v) => setFormData({...formData, call_category: v})}>
                    <SelectTrigger className="flex-grow"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Cat" className="w-24" />
                    <Button variant="outline" onClick={() => { if(newCategory) { setCategories([...categories, newCategory]); setNewCategory(''); } }}>Add</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 space-y-6 border border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <span className="text-indigo-600">📝</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Call Summary</span>
            </div>
            <Label>Notes & Key Details</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Provide a detailed editorial summary of the call..." rows={6} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-6 space-y-6 border border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <span className="text-indigo-600">👤</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Staff Assignment</span>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Call Received By</Label>
                <Select value={formData.received_by_staff_id} onValueChange={(v) => setFormData({...formData, received_by_staff_id: v})}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Information Entered By</Label>
                <Select value={formData.entered_by_staff_id} onValueChange={(v) => setFormData({...formData, entered_by_staff_id: v})}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select value={formData.assigned_to_team_id} onValueChange={(v) => setFormData({...formData, assigned_to_team_id: v})}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 space-y-6 border border-indigo-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <span className="text-indigo-600">✅</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Next Steps</span>
            </div>
            <Label>Required Action</Label>
            <div className="space-y-2">
              {actions.map(a => (
                <div key={a} className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input type="radio" name="next_step" checked={formData.required_action === a} onChange={() => setFormData({...formData, required_action: a})} />
                    <span className="text-xs font-semibold">{a}</span>
                  </label>
                  {a === 'others (manual edit)' && formData.required_action === a && (
                    <Input value={formData.required_action_details} onChange={(e) => setFormData({...formData, required_action_details: e.target.value})} placeholder="Enter details..." />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={handleSubmit}>Save Entry</Button>
            <Button variant="outline">Edit History</Button>
            <Button variant="destructive">Discard Entry</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
