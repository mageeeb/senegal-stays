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
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data?.map(item => item.role as UserRole) || [];
        setRoles(userRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (checkRole: UserRole) => roles.includes(checkRole);
  const isSuperAdmin = hasRole('super_admin');
  const primaryRole = roles.length > 0 ? roles[0] : null;

  return {
    role: primaryRole,
    roles,
    loading,
    isSuperAdmin,
    hasRole,
  };
};