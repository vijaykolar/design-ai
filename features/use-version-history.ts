import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Version {
  id: string;
  projectId: string;
  userId: string;
  name?: string;
  description?: string;
  snapshot: string;
  action: string;
  createdAt: string;
}

export interface VersionSnapshot {
  theme: string;
  frames: Array<{
    id: string;
    title: string;
    htmlContent: string;
  }>;
}

// Fetch version history for a project
export function useVersionHistory(projectId: string) {
  return useQuery({
    queryKey: ["versions", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/version?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch version history");
      return res.json() as Promise<Version[]>;
    },
    enabled: !!projectId,
  });
}

// Create a new version snapshot
export function useCreateVersion(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      description?: string;
      snapshot: VersionSnapshot;
      action: string;
    }) => {
      const res = await fetch("/api/version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          ...data,
          snapshot: JSON.stringify(data.snapshot),
        }),
      });

      if (!res.ok) throw new Error("Failed to create version");
      return res.json() as Promise<Version>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions", projectId] });
    },
    onError: (error) => {
      console.error("Failed to create version:", error);
      toast.error("Failed to save version");
    },
  });
}

// Restore a version
export function useRestoreVersion(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versionId: string) => {
      const res = await fetch(`/api/version/${versionId}/restore`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to restore version");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["versions", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });

      toast.success("Version restored successfully");

      // Force page reload to ensure all state is refreshed
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      console.error("Failed to restore version:", error);
      toast.error(error instanceof Error ? error.message : "Failed to restore version");
    },
  });
}

// Helper hook for undo/redo functionality
export function useUndoRedo(projectId: string) {
  const { data: versions } = useVersionHistory(projectId);
  const restoreVersion = useRestoreVersion(projectId);

  const canUndo = versions && versions.length > 1;
  const canRedo = false; // Redo is more complex, requires tracking current position

  const undo = () => {
    if (!canUndo || !versions) return;

    // Get the second most recent version (skip the current state)
    const previousVersion = versions[1];
    if (previousVersion) {
      restoreVersion.mutate(previousVersion.id);
    }
  };

  return {
    canUndo,
    canRedo,
    undo,
    redo: () => {}, // Placeholder for redo
    versions,
  };
}
