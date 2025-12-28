"use client";
import React, { memo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import Header from "./header";
import { useCreateProject, useGetProjects, useDeleteProject, useBatchDeleteProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { FolderOpenDotIcon, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { ProjectType } from "@/types/project";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const LandingSection = () => {
  const { user } = useKindeBrowserClient();
  const [promptText, setPromptText] = useState<string>("");
  const { mutate, isPending } = useCreateProject();
  const userId = user?.id;

  const { data: projects, isLoading, isError } = useGetProjects(userId!);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);

  const suggestions = [
    {
      label: "Finance Tracker",
      icon: "💸",
      value: `Finance app statistics screen. Current balance at top with dollar amount, bar chart showing spending over months (Oct-Mar) with month selector pills below, transaction list with app icons, amounts, and categories. Bottom navigation bar. Mobile app, single screen. Style: Dark theme, chunky rounded cards, playful but professional, modern sans-serif typography, Gen Z fintech vibe. Fun and fresh, not corporate.`,
    },
    {
      label: "Fitness Activity",
      icon: "🔥",
      value: `Fitness tracker summary screen. Large central circular progress ring showing steps and calories with neon glow. Line graph showing heart rate over time. Bottom section with grid of health metrics (Sleep, Water, SpO2). Mobile app, single screen. Style: Deep Dark Mode (OLED friendly). Pitch black background with electric neon green and vibrant blue accents. High contrast, data-heavy but organized, sleek and sporty aesthetic.`,
    },
    {
      label: "Food Delivery",
      icon: "🍔",
      value: `Food delivery home feed. Top search bar with location pin. Horizontal scrolling hero carousel of daily deals. Vertical list of restaurants with large delicious food thumbnails, delivery time badges, and rating stars. Floating Action Button (FAB) for cart. Mobile app, single screen. Style: Vibrant and Appetizing. Warm colors (orange, red, yellow), rounded card corners, subtle drop shadows to create depth. Friendly and inviting UI.`,
    },
    {
      label: "Travel Booking",
      icon: "✈️",
      value: `Travel destination detail screen. Full-screen immersive photography of a tropical beach. Bottom sheet overlay with rounded top corners containing hotel title, star rating, price per night, and a large "Book Now" button. Horizontal scroll of amenity icons. Mobile app, single screen. Style: Minimalist Luxury. ample whitespace, elegant serif typography for headings, clean sans-serif for body text. Sophisticated, airy, high-end travel vibe.`,
    },
    {
      label: "E-Commerce",
      icon: "👟",
      value: `Sneaker product page. Large high-quality product image on a light gray background. Color selector swatches, size selector grid, and a sticky "Add to Cart" button at the bottom. Title and price in bold, oversized typography. Mobile app, single screen. Style: Neo-Brutalism. High contrast, thick black outlines on buttons and cards, hard shadows (no blur), unrefined geometry, bold solid colors (yellow and black). Trendy streetwear aesthetic.`,
    },
    {
      label: "Meditation",
      icon: "🧘",
      value: `Meditation player screen. Central focus is a soft, abstract breathing bubble animation. Play/Pause controls and a time slider below. Background is a soothing solid pastel sage green. Mobile app, single screen. Style: Soft Minimal. Rounded corners on everything, low contrast text for relaxation, pastel color palette, very little UI clutter. Zen, calming, and therapeutic atmosphere.`,
    },
  ];

  const handleSuggestionClick = (val: string) => {
    setPromptText(val);
  };

  const handleSubmit = () => {
    if (!promptText) return;
    mutate(promptText);
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      console.log('Selected projects:', Array.from(newSet)); // Debug log
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedProjects(new Set());
  };

  return (
    <div className=" w-full min-h-screen">
      <div className="flex flex-col">
        <Header />

        <div className="relative overflow-hidden pt-28">
          <div
            className="max-w-6xl mx-auto flex flex-col
         items-center justify-center gap-8
        "
          >
            <div className="space-y-3">
              <h1
                className="text-center font-semibold text-4xl
            tracking-tight sm:text-5xl
            "
              >
                Design mobile apps <br className="md:hidden" />
                <span className="text-primary">in minutes</span>
              </h1>
              <div className="mx-auto max-w-2xl ">
                <p className="text-center font-medium text-foreground leading-relaxed sm:text-lg">
                  Go from idea to beautiful app mockups in minutes by chatting
                  with AI.
                </p>
              </div>
            </div>

            <div
              className="flex w-full max-w-3xl flex-col
            item-center gap-8 relative z-50
            "
            >
              <div className="w-full">
                <PromptInput
                  className="ring-2 ring-primary"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 px-5">
                <Suggestions>
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s.label}
                      suggestion={s.label}
                      className="text-xs! px-2.5"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            <div
              className="absolute -translate-x-1/2
             left-1/2 w-[5000px] h-[3000px] top-[80%] 2xl:top-[60%]
             -z-10"
            >
              <div
                className="-translate-x-1/2 absolute
               bottom-[calc(100%-300px)] left-1/2
               h-[2000px] w-[2000px]
               opacity-20 bg-radial-primary"
              ></div>
              <div
                className="absolute -mt-2.5
              size-full rounded-[50%]
               bg-primary/20 opacity-70
               [box-shadow:0_-15px_24.8px_var(--primary)]"
              ></div>
              <div
                className="absolute z-0 size-full
               rounded-[50%] bg-background"
              ></div>
            </div>
          </div>
        </div>

        <div className="w-full py-10">
          <div className="mx-auto max-w-3xl">
            {userId && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h1
                    className="font-medium text-xl
                  tracking-tight
                  "
                  >
                    Recent Projects {projects?.data?.length ? `(${projects.data.length})` : ''}
                  </h1>

                  {selectedProjects.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedProjects.size} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowBatchDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div
                    className="flex items-center
                  justify-center py-2
                  "
                  >
                    <Spinner className="size-10" />
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2
                  md:grid-cols-3 gap-3 mt-3
                    "
                  >
                    {projects?.data?.map((project: ProjectType) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={selectedProjects.has(project.id)}
                        onToggleSelect={toggleProjectSelection}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {isError && <p className="text-red-500">Failed to load projects</p>}
          </div>

          {/* Batch Delete Dialog */}
          <BatchDeleteDialog
            open={showBatchDeleteDialog}
            onOpenChange={setShowBatchDeleteDialog}
            selectedCount={selectedProjects.size}
            selectedProjects={selectedProjects}
            onSuccess={clearSelection}
          />
        </div>
      </div>
    </div>
  );
};

const ProjectCard = memo(({
  project,
  isSelected,
  onToggleSelect
}: {
  project: ProjectType;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useKindeBrowserClient();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const createdAtDate = new Date(project.createdAt);
  const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  const thumbnail = project?.thumbnail || null;

  const onRoute = () => {
    router.push(`/project/${project.id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if Ctrl (Windows/Linux) or Cmd (Mac) key is pressed
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      onToggleSelect(project.id);
    } else {
      onRoute();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteProject(project.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <div
      className={`w-full flex flex-col border rounded-xl cursor-pointer
    hover:shadow-md overflow-hidden relative group transition-all
    ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
    `}
      onClick={handleCardClick}
    >
      <div
        className="h-40 bg-[#eee] relative overflow-hidden
        flex items-center justify-center
        "
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            className="w-full h-full object-cover object-left
           scale-110
          "
            height={100}
            width={100}
            alt={thumbnail}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full bg-primary/20
              flex items-center justify-center text-primary
            "
          >
            <FolderOpenDotIcon />
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}

        {/* Vertical Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm
              hover:bg-background border border-border shadow-sm
              focus:outline-none focus:ring-2 focus:ring-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 flex flex-col">
        <h3
          className="font-semibold
         text-sm truncate w-full mb-1 line-clamp-1"
        >
          {project.name}
        </h3>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ProjectCard.displayName = "ProjectCard";

const BatchDeleteDialog = ({
  open,
  onOpenChange,
  selectedCount,
  selectedProjects,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedProjects: Set<string>;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();
  const { user } = useKindeBrowserClient();
  const { mutate: batchDelete, isPending } = useBatchDeleteProjects();

  const handleConfirmDelete = () => {
    const projectIds = Array.from(selectedProjects);
    console.log('Deleting projects:', projectIds); // Debug log
    batchDelete(projectIds, {
      onSuccess: () => {
        console.log('Successfully deleted projects'); // Debug log
        queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
        onOpenChange(false);
        onSuccess();
      },
      onError: (error) => {
        console.error('Error deleting projects:', error);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Projects</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount} project{selectedCount > 1 ? 's' : ''}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LandingSection;
