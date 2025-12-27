"use client";
import { useGetProjectById } from "@/features/use-project-id";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import Header from "./_common/header";
import Canvas from "@/components/canvas";
import { CanvasProvider } from "@/context/canvas-context";

export default function ProjectPage() {
  const { user } = useKindeBrowserClient();
  const params = useParams();
  const id = params.id as string;

  const { data: project, isPending } = useGetProjectById(id!);
  const frames = project?.frames || [];
  const themeId = project?.theme || "";
  console.log(project, "project");

  if (!isPending && !project) {
    return <div>Project not found</div>;
  }

  const hasInitialData = frames?.length > 0;

  return (
    <div
      className="relative h-screen w-full
   flex flex-col"
    >
      <Header projectName={project?.name} />
      <CanvasProvider
        initialFrames={frames}
        initialThemeId={themeId}
        hasInitialData={hasInitialData}
        projectId={project?.id}
      >
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1">
            <Canvas
              projectId={project?.id}
              projectName={project?.name}
              isPending={isPending}
            />
          </div>
        </div>
      </CanvasProvider>
    </div>
  );
}
