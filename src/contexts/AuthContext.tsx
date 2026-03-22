import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface User extends SupabaseUser {
  profile?: Profile;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  dummyLogin: (role: 'admin' | 'staff') => void;
  createOrganisation: (details: { name: string; address: string; phone: string; gstin?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      // 1. Check for Demo User in localStorage first
      const savedDemoUser = localStorage.getItem('constructflow_demo_user');
      if (savedDemoUser) {
        setUser(JSON.parse(savedDemoUser));
        setLoading(false);
        return;
      }

      // 2. Check real Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('constructflow_demo_user');
      } else if (session) {
        await fetchProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        setUser(supabaseUser as User);
      } else {
        setUser({ ...supabaseUser, profile } as User);
      }
    } catch (error) {
      setUser(supabaseUser as User);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (!error && data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, full_name: fullName, role: 'admin' }]);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    localStorage.removeItem('constructflow_demo_user'); // Clear demo if logging in for real
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const dummyLogin = (role: 'admin' | 'staff') => {
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo@constructflow.com',
      isDemo: true,
      app_metadata: {},
      user_metadata: { full_name: 'Demo ' + (role === 'admin' ? 'Administrator' : 'Staff') },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      profile: {
        id: '00000000-0000-0000-0000-000000000000',
        organisation_id: '00000000-0000-0000-0000-000000000001', // Hardcoded demo org
        full_name: 'Demo ' + (role === 'admin' ? 'Administrator' : 'Staff'),
        role: role,
        created_at: new Date().toISOString()
      }
    };
    setUser(demoUser);
    localStorage.setItem('constructflow_demo_user', JSON.stringify(demoUser));
    toast.success('Logged in as Demo User');
  };

  const createOrganisation = async (details: { name: string; address: string; phone: string; gstin?: string }) => {
    if (!user) return;
    if (user.isDemo) {
      // Simulate org creation for demo
      const updatedUser = { 
        ...user, 
        profile: { ...user.profile!, organisation_id: '00000000-0000-0000-0000-000000000002' } 
      };
      setUser(updatedUser);
      localStorage.setItem('constructflow_demo_user', JSON.stringify(updatedUser));
      toast.success('Demo Organisation Created!');
      return;
    }

    try {
      const { data: org, error: orgError } = await supabase.from('organisations').insert([{ name: details.name }]).select().single();
      if (orgError) throw orgError;
      const { error: profileUpdateError } = await supabase.from('profiles').update({ organisation_id: org.id }).eq('id', user.id);
      if (profileUpdateError) throw profileUpdateError;
      await fetchProfile(user);
      toast.success('Organisation setup complete!');
    } catch (error: any) {
      toast.error(`Error setting up organisation: ${error.message}`);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('constructflow_demo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      logout, 
      signUp, 
      signIn, 
      dummyLogin,
      createOrganisation, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
