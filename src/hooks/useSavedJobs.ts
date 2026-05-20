import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { fetchSavedJobIds, saveJob, unsaveJob } from "@/lib/supabase-queries";
import { track } from "@/lib/analytics";

export function useSavedJobs() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSavedIds(new Set());
      setLoading(false);
      return;
    }
    fetchSavedJobIds(user.id)
      .then(setSavedIds)
      .catch(() => setSavedIds(new Set()))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const toggleSave = useCallback(
    async (jobId: string) => {
      if (!user) {
        toast("Sign in to save jobs", {
          description: "Create a free account to bookmark jobs and get alerts.",
          action: { label: "Sign in", onClick: () => navigate({ to: "/login" }) },
        });
        return;
      }
      const isSaved = savedIds.has(jobId);
      // optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(jobId);
        else next.add(jobId);
        return next;
      });
      const result = isSaved
        ? await unsaveJob(user.id, jobId)
        : await saveJob(user.id, jobId);
      if (result.error) {
        // revert on failure
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
        toast.error(result.error);
      } else {
        toast.success(isSaved ? "Removed from saved jobs" : "Job saved");
      }
    },
    [user, savedIds, navigate],
  );

  return { savedIds, loading, toggleSave, isSaved: (id: string) => savedIds.has(id) };
}
