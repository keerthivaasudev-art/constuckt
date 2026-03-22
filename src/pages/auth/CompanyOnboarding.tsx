import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Phone, FileText, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function CompanyOnboarding() {
  const { user, createOrganisation } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createOrganisation({
        name: companyName,
        address,
        phone,
        gstin
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-slate-200 overflow-hidden">
          <div className="h-2 bg-blue-600" />
          <CardHeader className="space-y-2 text-center pt-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {user?.user_metadata?.full_name || 'there'}!
            </CardTitle>
            <CardDescription className="text-lg text-slate-500">
              Let's set up your company profile to get started with ConstructFlow
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="companyName" 
                    placeholder="Acme Construction Ltd." 
                    className="pl-10 h-11 border-slate-200 focus:ring-blue-500"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea 
                    id="address" 
                    placeholder="123 Construction Way, Industrial Area..." 
                    className="w-full min-h-[100px] pl-10 pr-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="+1 (555) 000-0000" 
                    className="pl-10 h-11 border-slate-200 focus:ring-blue-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstin" className="text-sm font-semibold text-slate-700">GSTIN / Tax ID (Optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="gstin" 
                    placeholder="22AAAAA0000A1Z5" 
                    className="pl-10 h-11 border-slate-200 focus:ring-blue-500"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  You can always update these details later in Settings.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
