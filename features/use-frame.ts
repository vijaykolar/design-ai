/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

export const useRegenerateFrame = (projectId: string) => {
  return useMutation({
    mutationFn: async ({
      frameId,
      prompt,
    }: {
      frameId: string;
      prompt: string;
    }) => {
      const res = await axios.post(
        `/api/project/${projectId}/frame/regenerate`,
        {
          frameId,
          prompt,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Frame regeneration started");
    },
    onError: () => {
      toast.error("Failed to regenerate frame");
    },
  });
};

export const useDeleteFrame = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (frameId: string) => {
      const res = await axios.delete(`/api/project/${projectId}/frame/delete`, {
        data: { frameId },
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate project query to refresh frames immediately
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Frame deleted successfully");
    },
    onError: (error: any) => {
      console.log("Delete frame failed", error);
      toast.error("Failed to delete frame");
    },
  });
};

export const useCopyFrame = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (frameId: string) => {
      const res = await axios.post(`/api/project/${projectId}/frame/copy`, {
        frameId,
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate project query to refresh frames
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Frame copied successfully");
    },
    onError: (error: any) => {
      console.log("Copy frame failed", error);
      toast.error("Failed to copy frame");
    },
  });
};
