import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Lock, LayoutDashboard, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, dummyLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDummyLogin = (role: 'admin' | 'staff') => {
    dummyLogin(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-slate-500">
            Access your ConstructFlow ERP account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Demo Access */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider text-center">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 h-10 font-semibold"
                onClick={() => handleDummyLogin('admin')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" /> Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 h-10 font-semibold"
                onClick={() => handleDummyLogin('staff')}
              >
                <UserCheck className="w-4 h-4 mr-2" /> Staff
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-2 text-slate-400 font-medium">Or use credentials</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold shadow-lg shadow-blue-600/20"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-slate-500">
          Don't have an account?
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
