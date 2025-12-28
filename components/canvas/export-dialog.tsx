"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExportComponent, FrameworkType } from "@/features/use-export";
import { Spinner } from "@/components/ui/spinner";
import { Copy, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string;
  frameTitle: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  htmlContent,
  frameTitle,
}: ExportDialogProps) {
  const [framework, setFramework] = useState<FrameworkType>("react");
  const [componentName, setComponentName] = useState(
    frameTitle
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]/g, "") || "MyComponent"
  );
  const [exportedCode, setExportedCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const exportMutation = useExportComponent();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        htmlContent,
        framework,
        componentName,
      });
      setExportedCode(result.code);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportedCode);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const fileExtensions: Record<FrameworkType, string> = {
      react: "tsx",
      "react-native": "tsx",
      flutter: "dart",
    };

    const extension = fileExtensions[framework];
    const blob = new Blob([exportedCode], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${componentName}.${extension}`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Code downloaded");
  };

  const handleFrameworkChange = (value: string) => {
    setFramework(value as FrameworkType);
    setExportedCode(""); // Clear previous export
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Component</DialogTitle>
          <DialogDescription>
            Export your design as a code component for different frameworks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          <div className="space-y-2">
            <Label htmlFor="componentName">Component Name</Label>
            <Input
              id="componentName"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="MyComponent"
            />
          </div>

          <Tabs value={framework} onValueChange={handleFrameworkChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="react-native">React Native</TabsTrigger>
              <TabsTrigger value="flutter">Flutter</TabsTrigger>
            </TabsList>

            <TabsContent value="react" className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Export as a React TypeScript component with JSX
              </p>
            </TabsContent>

            <TabsContent value="react-native" className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Export as a React Native component with StyleSheet
              </p>
            </TabsContent>

            <TabsContent value="flutter" className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Export as a Flutter StatelessWidget
              </p>
            </TabsContent>
          </Tabs>

          {!exportedCode && (
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending || !componentName}
              className="w-full"
            >
              {exportMutation.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Code"
              )}
            </Button>
          )}

          {exportedCode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Generated Code</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCode}
                    className="gap-2"
                  >
                    <Download className="size-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  <code>{exportedCode}</code>
                </pre>
              </div>

              <Button
                onClick={() => setExportedCode("")}
                variant="outline"
                className="w-full"
              >
                Generate New Code
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
