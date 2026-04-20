import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "moderator" | "user";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<Set<AppRole>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setRoles(new Set((data ?? []).map((r) => r.role as AppRole)));
        setLoading(false);
      });
  }, [user, authLoading]);

  return {
    loading: authLoading || loading,
    roles,
    isAdmin: roles.has("admin"),
    isModerator: roles.has("moderator"),
  };
}
