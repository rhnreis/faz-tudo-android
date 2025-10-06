import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  feature?: 'games' | 'signals' | 'vip-signals';
}

export const ProtectedRoute = ({ children, feature }: ProtectedRouteProps) => {
  const { user, profile, loading, hasAccess, isMaster } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile && feature && !hasAccess(feature)) {
      toast({
        title: "Acesso negado",
        description: "Você precisa fazer upgrade do seu plano para acessar este recurso.",
        variant: "destructive",
      });
      navigate('/plans');
    }
  }, [loading, user, profile, feature, hasAccess, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Também verifica localStorage para o caso do auth ainda estar sendo restaurado
  let localIsMaster = false;
  try {
    const flag = localStorage.getItem('isMaster');
    if (flag === '1') localIsMaster = true;
  } catch (e) {}

  if (!user && !localIsMaster) {
    return <Navigate to="/login" replace />;
  }

  // Usuário master tem acesso irrestrito
  if (isMaster || localIsMaster) {
    return <>{children}</>;
  }

  if (feature && profile && !hasAccess(feature)) {
    return <Navigate to="/plans" replace />;
  }

  return <>{children}</>;
};
