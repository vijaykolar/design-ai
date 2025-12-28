import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateProject = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (prompt: string) =>
      await axios
        .post("/api/project", {
          prompt,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      console.log(data);

      router.push(`/project/${data?.data?.id}`);
    },
    onError: (error) => {
      console.log("Project failed", error);
      toast.error("Failed to create project");
    },
  });
};

export const useGetProjects = (userId: string) => {
  return useQuery({
    queryKey: ["projects", userId],
    queryFn: async () =>
      await axios.get("/api/project").then((res) => res.data),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // cacheTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useDuplicateProject = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (projectId: string) =>
      await axios
        .post(`/api/project/${projectId}/duplicate`)
        .then((res) => res.data),
    onSuccess: (data) => {
      toast.success("Project duplicated successfully");
      router.push(`/project/${data?.project?.id}`);
    },
    onError: (error) => {
      console.error("Duplicate project failed", error);
      toast.error("Failed to duplicate project");
    },
  });
};

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: async (projectId: string) =>
      await axios
        .delete(`/api/project/${projectId}`)
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error("Delete project failed", error);
      toast.error("Failed to delete project");
    },
  });
};

export const useBatchDeleteProjects = () => {
  return useMutation({
    mutationFn: async (projectIds: string[]) => {
      const deletePromises = projectIds.map((id) =>
        axios.delete(`/api/project/${id}`)
      );
      return await Promise.all(deletePromises);
    },
    onSuccess: (_, projectIds) => {
      const count = projectIds.length;
      toast.success(`Successfully deleted ${count} project${count > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      console.error("Batch delete failed", error);
      toast.error("Failed to delete some projects");
    },
  });
};
