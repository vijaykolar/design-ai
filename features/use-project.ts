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
