import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

export type FrameworkType = "react" | "react-native" | "flutter";

interface ExportParams {
  htmlContent: string;
  framework: FrameworkType;
  componentName: string;
}

interface ExportResponse {
  code: string;
  framework: FrameworkType;
  componentName: string;
}

export const useExportComponent = () => {
  return useMutation({
    mutationFn: async (params: ExportParams): Promise<ExportResponse> => {
      const res = await axios.post("/api/export", params);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Component exported successfully");
    },
    onError: (error) => {
      console.error("Export failed:", error);
      toast.error("Failed to export component");
    },
  });
};
