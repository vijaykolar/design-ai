import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { generateScreens } from "@/inngest/functions/generate-screens";
import { regenerateFrame } from "@/inngest/functions/regenerate-frame";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateScreens, regenerateFrame],
});
