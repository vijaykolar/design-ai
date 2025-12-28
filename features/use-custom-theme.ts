import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export interface CustomTheme {
  id: string;
  userId: string;
  name: string;
  description?: string;
  style: string;
  isPublic: boolean;
  likes: number;
  likedBy: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Fetch user's custom themes + public themes
export function useCustomThemes() {
  return useQuery({
    queryKey: ["custom-themes"],
    queryFn: async () => {
      const { data } = await axios.get<CustomTheme[]>("/api/custom-theme");
      return data;
    },
  });
}

// Fetch marketplace themes (only public themes)
export function useMarketplaceThemes() {
  return useQuery({
    queryKey: ["marketplace-themes"],
    queryFn: async () => {
      const { data } = await axios.get<CustomTheme[]>(
        "/api/custom-theme?marketplace=true"
      );
      return data;
    },
  });
}

// Create a new custom theme
export function useCreateCustomTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (themeData: {
      name: string;
      description: string;
      colors: Record<string, string>;
      isPublic: boolean;
      tags: string[];
    }) => {
      const { data } = await axios.post<CustomTheme>(
        "/api/custom-theme",
        themeData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-themes"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-themes"] });
      toast.success("Custom theme created successfully");
    },
    onError: () => {
      toast.error("Failed to create custom theme");
    },
  });
}

// Update a custom theme
export function useUpdateCustomTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      colors?: Record<string, string>;
      isPublic?: boolean;
      tags?: string[];
    }) => {
      const { data: theme } = await axios.patch<CustomTheme>(
        `/api/custom-theme/${id}`,
        data
      );
      return theme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-themes"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-themes"] });
      toast.success("Theme updated successfully");
    },
    onError: () => {
      toast.error("Failed to update theme");
    },
  });
}

// Delete a custom theme
export function useDeleteCustomTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/custom-theme/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-themes"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-themes"] });
      toast.success("Theme deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete theme");
    },
  });
}

// Like/Unlike a theme
export function useLikeTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post<{ liked: boolean; likes: number }>(
        `/api/custom-theme/${id}/like`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-themes"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-themes"] });
    },
    onError: () => {
      toast.error("Failed to like theme");
    },
  });
}
