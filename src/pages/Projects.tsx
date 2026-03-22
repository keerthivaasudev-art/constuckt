import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Project, Client, ProjectStatus, ProjectType } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Search, MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [status, setStatus] = useState<ProjectStatus>('Draft');
  const [poRequired, setPoRequired] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Project & { clients: { name: string } })[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('id, name');
      if (error) throw error;
      return data as Pick<Client, 'id' | 'name'>[];
    },
  });

  const { data: projectTypes } = useQuery({
    queryKey: ['project-types'],
    staleTime: 1000 * 60 * 10, // 10 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as ProjectType[];
    },
  });

  const addProjectTypeMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('project_types')
        .insert([{ name, is_active: true }])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
      setNewTypeName('');
      setIsAddingNewType(false);
      toast.success('Project type added successfully');
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveTab('all');
      toast.success('Project added successfully');
    },
    onError: (error) => {
      toast.error(`Error adding project: ${error.message}`);
    },
  });

  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addProjectMutation.mutate({
      name: formData.get('name') as string,
      client_id: formData.get('client_id') as string,
      status: status,
      project_type: formData.get('project_type') as string,
      po_value: parseFloat(formData.get('po_value') as string) || 0,
      po_required: poRequired,
      description: formData.get('description') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    });
  };

  const statusColors: Record<ProjectStatus, string> = {
    'Draft': 'bg-slate-100 text-slate-700',
    'Active': 'bg-blue-100 text-blue-700',
    'Execution Completed': 'bg-emerald-100 text-emerald-700',
    'Financially Closed': 'bg-amber-100 text-amber-700',
    'Closed': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500">Track and manage your ongoing projects.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1">
          <TabsTrigger value="all" className="gap-2">
            <List className="w-4 h-4" /> All Projects
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <Plus className="w-4 h-4" /> Create Project
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search projects..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Loading projects...
                    </TableCell>
                  </TableRow>
                ) : filteredProjects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.clients?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[project.status]}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500 capitalize">{project.project_type}</span>
                      </TableCell>
                      <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900">Create New Project</h2>
              <p className="text-sm text-slate-500">Fill in the details below to start a new project.</p>
            </div>
            
            <form onSubmit={handleAddProject} className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">Project Name *</Label>
                    <Input id="name" name="name" placeholder="e.g. Modern Villa Renovation" required className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_id" className="text-slate-700 font-medium">Client *</Label>
                    <Select 
                      name="client_id" 
                      required
                      items={clients?.map(c => ({ value: c.id, label: c.name })) || []}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project_type" className="text-slate-700 font-medium">Project Type *</Label>
                    <div className="flex gap-2">
                      <Select 
                        name="project_type" 
                        required
                        items={[
                          { value: 'new', label: 'New' },
                          { value: 'expansion', label: 'Expansion' },
                          { value: 'service', label: 'Service' },
                          ...(projectTypes?.map(t => ({ value: t.name.toLowerCase(), label: t.name })) || [])
                        ]}
                      >
                        <SelectTrigger className="h-11 flex-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="expansion">Expansion</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          {projectTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.name.toLowerCase()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-11 px-3"
                        onClick={() => setIsAddingNewType(!isAddingNewType)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {isAddingNewType && (
                      <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                        <Input 
                          placeholder="New type name..." 
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          className="h-10"
                        />
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={() => {
                            if (newTypeName.trim()) {
                              addProjectTypeMutation.mutate(newTypeName.trim());
                            }
                          }}
                          disabled={addProjectTypeMutation.isPending}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-slate-700 font-medium">Start Date *</Label>
                      <Input id="start_date" name="start_date" type="date" required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-slate-700 font-medium">End Date</Label>
                      <Input id="end_date" name="end_date" type="date" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="po_required" className="text-slate-700 font-medium">PO Required?</Label>
                      <Switch 
                        id="po_required" 
                        checked={poRequired}
                        onCheckedChange={setPoRequired}
                      />
                    </div>
                    
                    {poRequired && (
                      <div className="space-y-2 animate-in fade-in zoom-in-95">
                        <Label htmlFor="po_value" className="text-slate-700 font-medium">PO Value</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                          <Input 
                            id="po_value" 
                            name="po_value" 
                            type="number" 
                            placeholder="0.00" 
                            className="h-11 pl-7"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {(['Draft', 'Active', 'Execution Completed', 'Financially Closed', 'Closed'] as ProjectStatus[]).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant="outline"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "h-10 px-4 text-sm font-medium transition-all",
                        status === s 
                          ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      )}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe the project scope and objectives..." 
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setActiveTab('all')}
                  className="h-11 px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-11 px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                  disabled={addProjectMutation.isPending}
                >
                  {addProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
