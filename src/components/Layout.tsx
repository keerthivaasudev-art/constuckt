import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  MapPin, 
  Settings,
  Package,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  LogOut,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { BottomNav } from './shared/BottomNav';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: ClipboardCheck, label: 'Site Reports', path: '/projects/site-report' },
  { icon: Package, label: 'Materials', path: '/materials' },
  { icon: MessageSquare, label: 'Communication', path: '/communication' },
  { icon: MapPin, label: 'Site Visits', path: '/site-visits' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className={cn(
        "hidden lg:flex flex-col shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ease-in-out z-30",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Sidebar Header */}
        <div className={cn("flex items-center h-16 px-6 border-b border-slate-100 shrink-0", isCollapsed ? "justify-center px-0" : "justify-between")}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">C</div>
            {!isCollapsed && <span className="text-xl font-bold text-slate-900 tracking-tight ml-3">ConstructFlow</span>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0">
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    isCollapsed && "justify-center px-0"
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 shrink-0">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Need help?</p>
              <Button variant="link" className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700">
                View Documentation
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
          <div className="flex items-center flex-1">
            {/* Header Search */}
            <div className="hidden md:flex relative w-96 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search projects, clients..." 
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
              />
            </div>
            {/* Mobile Title */}
            <div className="flex items-center lg:hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">C</div>
              <span className="text-lg font-bold text-slate-900 tracking-tight ml-3">ConstructFlow</span>
            </div>
          </div>

          {/* Right Side Menus & Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500 relative hidden sm:flex">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                asChild
              >
                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors group outline-none">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'Admin User'}</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">
                      {user?.companyDetails?.name || 'Administrator'}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold overflow-hidden">
                    <User className="w-5 h-5" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Company Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <nav className="fixed bottom-0 inset-x-0 lg:hidden border-t bg-white safe-area-pb z-40">
        <BottomNav />
      </nav>
    </div>
  );
}
