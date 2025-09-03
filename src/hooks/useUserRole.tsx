import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'user' | 'host' | 'super_admin';

interface UseUserRoleReturn {
  role: UserRole | null;
  roles: UserRole[];
  loading: boolean;
  isSuperAdmin: boolean;
  hasRole: (checkRole: UserRole) => boolean;
  refreshRoles: () => Promise<void>;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async () => {
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching roles for user ID:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      const userRoles = data?.map(item => item.role as UserRole) || [];
      console.log('Fetched roles for user:', user.email, 'roles:', userRoles);
      setRoles(userRoles);
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user?.id]);

  const hasRole = (checkRole: UserRole) => roles.includes(checkRole);
  const isSuperAdmin = hasRole('super_admin');
  const primaryRole = roles.length > 0 ? roles[0] : null;

  console.log('useUserRole FINAL STATE:', { 
    isSuperAdmin, 
    roles, 
    loading, 
    userEmail: user?.email,
    userId: user?.id,
    hasRole: hasRole('super_admin')
  });

  return {
    role: primaryRole,
    roles,
    loading,
    isSuperAdmin,
    hasRole,
    refreshRoles: fetchUserRoles,
  };
};