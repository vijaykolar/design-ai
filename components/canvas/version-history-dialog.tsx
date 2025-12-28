"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, RotateCcw, Clock, Save, Wand2, Edit3, Trash2 } from "lucide-react";
import { useVersionHistory, useRestoreVersion } from "@/features/use-version-history";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const ACTION_ICONS: Record<string, typeof Save> = {
  save: Save,
  generate: Wand2,
  edit: Edit3,
  delete: Trash2,
  restore: RotateCcw,
};

const ACTION_LABELS: Record<string, string> = {
  save: "Saved",
  generate: "Generated",
  edit: "Edited",
  delete: "Deleted",
  restore: "Restored",
};

const ACTION_COLORS: Record<string, string> = {
  save: "bg-blue-500/10 text-blue-700 border-blue-200",
  generate: "bg-purple-500/10 text-purple-700 border-purple-200",
  edit: "bg-green-500/10 text-green-700 border-green-200",
  delete: "bg-red-500/10 text-red-700 border-red-200",
  restore: "bg-orange-500/10 text-orange-700 border-orange-200",
};

export function VersionHistoryDialog({
  open,
  onOpenChange,
  projectId,
}: VersionHistoryDialogProps) {
  const { data: versions, isLoading } = useVersionHistory(projectId);
  const restoreVersion = useRestoreVersion(projectId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    await restoreVersion.mutateAsync(versionId);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
              <History className="size-5 text-blue-600" />
            </div>
            Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of your project
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col min-h-0 flex-1 px-6 pb-6">
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : versions && versions.length > 0 ? (
              <div className="space-y-2 pr-4 pb-4">
                {versions.map((version, index) => {
                  const Icon = ACTION_ICONS[version.action] || Clock;
                  const isExpanded = expandedId === version.id;
                  const isCurrent = index === 0;

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        "group relative border-2 rounded-lg transition-all",
                        isCurrent
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {/* Timeline connector */}
                      {index < versions.length - 1 && (
                        <div className="absolute left-[30px] top-[48px] w-0.5 h-6 bg-gray-200" />
                      )}

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={cn(
                            "p-2 rounded-lg border-2 shrink-0 transition-colors",
                            ACTION_COLORS[version.action] || "bg-gray-100 text-gray-700 border-gray-200"
                          )}>
                            <Icon className="size-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h3 className="font-semibold text-sm">
                                  {version.name || ACTION_LABELS[version.action] || "Version"}
                                </h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  <Clock className="size-3" />
                                  {formatDate(version.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isCurrent && (
                                  <Badge variant="secondary" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                                {!isCurrent && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestore(version.id)}
                                    disabled={restoreVersion.isPending}
                                    className="h-7 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <RotateCcw className="size-3" />
                                    Restore
                                  </Button>
                                )}
                              </div>
                            </div>

                            {version.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {version.description}
                              </p>
                            )}

                            {/* Expandable snapshot preview */}
                            {!isCurrent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedId(isExpanded ? null : version.id)}
                                className="h-6 text-xs mt-2 px-2 text-muted-foreground"
                              >
                                {isExpanded ? "Hide" : "Show"} details
                              </Button>
                            )}

                            {isExpanded && (
                              <div className="mt-2 p-3 rounded-md bg-gray-50 border text-xs space-y-1">
                                {(() => {
                                  try {
                                    const snapshot = JSON.parse(version.snapshot);
                                    return (
                                      <>
                                        <div>
                                          <span className="font-medium">Theme:</span>{" "}
                                          <span className="text-muted-foreground">{snapshot.theme || "Default"}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium">Frames:</span>{" "}
                                          <span className="text-muted-foreground">
                                            {snapshot.frames?.length || 0} frame(s)
                                          </span>
                                        </div>
                                      </>
                                    );
                                  } catch {
                                    return <span className="text-muted-foreground">Invalid snapshot data</span>;
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <History className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No version history</h3>
                <p className="text-sm text-muted-foreground">
                  Versions will appear here as you make changes
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
