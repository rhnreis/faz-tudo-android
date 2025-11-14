import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localLogin, localRegister } from '@/lib/localApi';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  plan: 'basico' | 'premium' | 'vip';
  plan_expires_at: string | null;
}

interface AuthContextType {
  user: any;
  session: any;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasAccess: (feature: 'games' | 'signals' | 'vip-signals') => boolean;
  isMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // start as loading until we restore persisted auth (prevents ProtectedRoute redirect)
  const [loading, setLoading] = useState(true);
  // Carrega estado do localStorage para persistência simples
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setProfile(parsed.profile || null);
        setSession(parsed.session || null);
      }
    } catch (e) {
      // ignore
    } finally {
      // finished restoring
      setLoading(false);
    }
  }, []);
  const navigate = useNavigate();
  const isMaster = user?.email === 'rodrigohnreis@gmail.com';

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await localRegister(email, password);
    if (result.error) return { error: result.error };
    navigate('/plans');
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await localLogin(email, password);
    if (result.error) {
      setLoading(false);
      return { error: result.error };
    }
    const userObj = { id: result.id, email: result.email };
    setUser(userObj);
    setProfile(result.profile || null);
    setSession(result.session || null);
    // Persiste no localStorage
    try { 
      localStorage.setItem('auth', JSON.stringify({ user: userObj, profile: result.profile || null, session: result.session || null }));
      if (userObj.email === 'rodrigohnreis@gmail.com') localStorage.setItem('isMaster','1'); else localStorage.removeItem('isMaster');
    } catch (e) {}
    setLoading(false);
    navigate('/dashboard');
    return { error: null };
  };

  const signOut = async () => {
    setProfile(null);
    setUser(null);
    setSession(null);
    try { localStorage.removeItem('auth'); } catch (e) {}
    try { localStorage.removeItem('isMaster'); } catch (e) {}
    navigate('/');
  };

  const hasAccess = (feature: 'games' | 'signals' | 'vip-signals'): boolean => {
    if (!profile) return false;
    if (profile.plan_expires_at) {
      const expiryDate = new Date(profile.plan_expires_at);
      if (expiryDate < new Date()) {
        return false;
      }
    }
    switch (feature) {
      case 'games':
        return ['basico', 'premium', 'vip'].includes(profile.plan);
      case 'signals':
        return ['premium', 'vip'].includes(profile.plan);
      case 'vip-signals':
        return profile.plan === 'vip';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        profile, 
        loading, 
        signUp, 
        signIn, 
        signOut, 
        hasAccess,
        isMaster
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
