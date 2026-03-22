import { LayoutDashboard, Users, Briefcase, Package, MapPin, MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home',      icon: LayoutDashboard, path: '/' },
  { label: 'Clients',   icon: Users,           path: '/clients' },
  { icon: Package, label: 'Materials', path: '/materials' },
  { label: 'Projects',  icon: Briefcase,       path: '/projects' },
  { label: 'More',      icon: MoreHorizontal,  path: '/settings' },
]

export function BottomNav() {
  return (
    <div className="flex items-center justify-around h-16 px-2">
      {tabs.map(tab => (
        <NavLink key={tab.path} to={tab.path}
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors',
               isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900')
          }>
          <tab.icon className="w-5 h-5" />
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
