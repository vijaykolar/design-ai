import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
import { useState } from "react";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constants/canvas";
import CanvasControls from "./canvas-controls";
type Props = {
  projectId?: string;
  projectName?: string | null;
  isPending?: boolean;
};

const Canvas = ({ projectId, projectName, isPending }: Props) => {
  const { frames, setSelectedFrameId, theme, loadingStatus, selectedFrame } =
    useCanvas();

  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT);
  const [zoomPercent, setZoomPercent] = useState<number>(53);
  const [currentScale, setCurrentScale] = useState<number>(0.53);
  const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentStatus = isPending
    ? "fetching"
    : loadingStatus !== "idle" && loadingStatus !== "completed"
    ? loadingStatus
    : null;
  return (
    <div className="relative w-full h-full overflow-hidden">
      <CanvasFloatingToolbar />
      {currentStatus && <CanvasLoader status={currentStatus} />}
      <TransformWrapper
        initialScale={0.53}
        initialPositionX={40}
        initialPositionY={5}
        minScale={0.1}
        maxScale={3}
        wheel={{ step: 0.1 }}
        pinch={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        centerZoomedOut={false}
        centerOnInit={false}
        smooth={true}
        limitToBounds={false}
        panning={{
          disabled: toolMode !== TOOL_MODE_ENUM.HAND,
        }}
        onTransformed={(ref) => {
          setZoomPercent(Math.round(ref.state.scale * 100));
          setCurrentScale(ref.state.scale);
        }}
      >
        {({ zoomIn, zoomOut }) => (
          <>
            <div
              className={cn(
                `absolute inset-0 w-full h-full bg-[#eee]
                  dark:bg-[#242423] p-3
              `,
                toolMode === TOOL_MODE_ENUM.HAND
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-default"
              )}
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "unset",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "red",
                }}
              >
                <div className="size-5 bg-primary">Box</div>
              </TransformComponent>
            </div>
            <CanvasControls
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              zoomPercent={zoomPercent}
              toolMode={toolMode}
              setToolMode={setToolMode}
            />
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

function CanvasLoader({ status }: { status: LoadingStatusType | "fetching" }) {
  return (
    <div
      className={cn(
        `absolute left-1/2 -translate-x-1/2 top-4 min-w-40 max-w-fit px-4 pt-1.5 pb-2 rounded-br-xl rounded-bl-xl shadow-md flex items-center space-x-2 z-50`,
        status === "fetching" && "bg-gray-500 text-white",
        status === "running" && "bg-blue-700 text-white",
        status === "analyzing" && "bg-primary text-white",
        status === "generating" && "bg-purple-500 text-white"
      )}
    >
      <Spinner className="size-4" />
      <span className="text-sm font-semibold capitalize">
        {status === "fetching" ? "Loading project" : status}
      </span>
    </div>
  );
}
export default Canvas;
