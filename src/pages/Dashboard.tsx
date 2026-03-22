import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, MessageSquare, MapPin } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Total Clients', value: '24', icon: Users, color: 'text-blue-600' },
    { label: 'Active Projects', value: '12', icon: Briefcase, color: 'text-emerald-600' },
    { label: 'Recent Communications', value: '48', icon: MessageSquare, color: 'text-amber-600' },
    { label: 'Upcoming Site Visits', value: '5', icon: MapPin, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back to ConstructFlow CRM.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">No recent projects found.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">No upcoming visits scheduled.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
