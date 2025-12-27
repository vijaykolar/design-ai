import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
type Props = {
  projectId?: string;
  projectName?: string | null;
  isPending?: boolean;
};

const Canvas = ({ projectId, projectName, isPending }: Props) => {
  const { frames, setSelectedFrameId, theme, loadingStatus, selectedFrame } =
    useCanvas();
  const currentStatus = isPending
    ? "fetching"
    : loadingStatus !== "idle" && loadingStatus !== "completed"
    ? loadingStatus
    : null;
  return (
    <div className="relative w-full h-full overflow-hidden">
      <CanvasFloatingToolbar />
      {currentStatus && <CanvasLoader status={currentStatus} />}
      <div
        className={cn(
          "absolute w-full inset-0 h-full bg-[#eee] dark:bg-[#242423] p-3"
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>
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
