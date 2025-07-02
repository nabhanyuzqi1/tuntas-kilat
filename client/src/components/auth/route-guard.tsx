import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RouteGuard({ 
  children, 
  requireAuth = false, 
  allowedRoles = [], 
  redirectTo = '/auth' 
}: RouteGuardProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    if (isAuthenticated && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = getRedirectPathForRole(user.role);
        setLocation(redirectPath);
        return;
      }
    }
  }, [isAuthenticated, user, loading, requireAuth, allowedRoles, redirectTo, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isAuthenticated && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

function getRedirectPathForRole(role: string): string {
  switch (role) {
    case 'admin_umum':
    case 'admin_perusahaan':
      return '/admin';
    case 'worker':
      return '/worker';
    case 'customer':
    default:
      return '/';
  }
}

// Convenience components for common use cases
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard requireAuth={false}>{children}</RouteGuard>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard requireAuth={true}>{children}</RouteGuard>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      requireAuth={true} 
      allowedRoles={['admin_umum', 'admin_perusahaan']}
    >
      {children}
    </RouteGuard>
  );
}

export function WorkerRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard 
      requireAuth={true} 
      allowedRoles={['worker']}
    >
      {children}
    </RouteGuard>
  );
}