/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateObject, generateText, stepCountIs } from "ai";
import { inngest } from "../client";
import { z } from "zod";
//import { openrouter } from "@/lib/openrouter";
import { FrameType } from "@/types/project";
import { ANALYSIS_PROMPT, GENERATION_SYSTEM_PROMPT } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/theme";
import { unsplashTool } from "../tool";

const AnalysisSchema = z.object({
  theme: z
    .string()
    .describe(
      "The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')."
    ),
  screens: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            "Unique identifier for the screen (e.g., 'home-dashboard', 'profile-settings', 'transaction-history'). Use kebab-case."
          ),
        name: z
          .string()
          .describe(
            "Short, descriptive name of the screen (e.g., 'Home Dashboard', 'Profile', 'Transaction History')"
          ),
        purpose: z
          .string()
          .describe(
            "One clear sentence explaining what this screen accomplishes for the user and its role in the app"
          ),
        visualDescription: z
          .string()
          .describe(
            "A dense, high-fidelity visual directive (like an image generation prompt). Describe the layout, specific data examples (e.g. 'Oct-Mar'), component hierarchy, and physical attributes (e.g. 'Chunky cards', 'Floating header','Floating action button', 'Bottom navigation',Header with user avatar)."
          ),
      })
    )
    .min(1)
    .max(4),
});

export const generateScreens = inngest.createFunction(
  { id: "generate-ui-screens" },
  { event: "ui/generate.screens" },

  async ({ event, step, publish }: any) => {
    const {
      userId,
      projectId,
      prompt,

      frames,
      theme: existingTheme,
    } = event.data;
    const CHANNEL = `user:${userId}`;

    await publish({
      channel: CHANNEL,
      topic: "generation.start",
      data: {
        status: "running",
        projectId: projectId,
      },
    });

    // ALWAYS fetch existing frames from database to ensure UI consistency
    const existingFrames = await prisma.frame.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    // Get existing project theme
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { theme: true },
    });

    const isExistingGeneration = existingFrames.length > 0;

    //Analyze or plan
    const analysis = await step.run("analyze-and-plan-screens", async () => {
      await publish({
        channel: CHANNEL,
        topic: "analysis.start",
        data: {
          status: "analyzing",
          projectId: projectId,
        },
      });

      const contextHTML = isExistingGeneration
        ? existingFrames
            .map(
              (frame: FrameType) =>
                `<!-- ${frame.title} -->\n${frame.htmlContent}`
            )
            .join("\n\n")
        : "";

      const analysisPrompt = isExistingGeneration
        ? `
          USER REQUEST: ${prompt}
          SELECTED THEME: ${project?.theme}

          EXISTING SCREENS (analyze for consistency navigation, layout, design system etc):
          ${contextHTML}

         CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
          - **YOU MUST use the EXACT same theme: ${project?.theme}
          - **Analyze the existing screens' layout, navigation patterns, and design system
          - **Extract the EXACT bottom navigation component structure and styling
          - **Identify common components (cards, buttons, headers) for reuse
          - **Maintain the EXACT same visual hierarchy, spacing, fonts, and color scheme
          - **The new screens MUST look identical in style to existing screens - same fonts, same colors, same spacing
          - **Generate new screens that seamlessly blend with existing ones
          - **DO NOT change or deviate from the existing design system
        `.trim()
        : `
          USER REQUEST: ${prompt}
        `.trim();

      const { object } = await generateObject({
        model: "google/gemini-3-pro-preview",
        schema: AnalysisSchema,
        system: ANALYSIS_PROMPT,
        prompt: analysisPrompt,
      });

      // CRITICAL: Always use existing project theme if it exists to maintain consistency
      const themeToUse = isExistingGeneration ? project?.theme : object.theme;

      // Override the theme in the analysis result to enforce consistency
      if (isExistingGeneration && project?.theme) {
        object.theme = project.theme;
      }

      if (!isExistingGeneration) {
        await prisma.project.update({
          where: {
            id: projectId,
            userId,
          },
          data: { theme: themeToUse },
        });
      }

      await publish({
        channel: CHANNEL,
        topic: "analysis.complete",
        data: {
          status: "generating",
          theme: themeToUse,
          totalScreens: object.screens.length,
          screens: object.screens,
          projectId: projectId,
        },
      });

      return { ...object, themeToUse };
    });

    // Actuall generation of each screens
    // Start with ALL existing frames from database for consistency
    const generatedFrames: typeof frames = [...existingFrames];

    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find(
        (t) => t.id === analysis.themeToUse
      );

      //Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      // Get ALL existing frames PLUS newly generated ones for complete context
      const allPreviousFrames = generatedFrames;
      const previousFramesContext = allPreviousFrames
        .map((f: FrameType) => `<!-- ${f.title} -->\n${f.htmlContent}`)
        .join("\n\n");

      await step.run(`generated-screen-${i}`, async () => {
        const result = await generateText({
          model: "google/gemini-3-pro-preview",
          system: GENERATION_SYSTEM_PROMPT,
          tools: {
            searchUnsplash: unsplashTool,
          },
          stopWhen: stepCountIs(5),
          prompt: `
          - Screen ${i + 1}/${analysis.screens.length}
          - Screen ID: ${screenPlan.id}
          - Screen Name: ${screenPlan.name}
          - Screen Purpose: ${screenPlan.purpose}

          VISUAL DESCRIPTION: ${screenPlan.visualDescription}

          EXISTING SCREENS REFERENCE (Extract and reuse their components):
          ${previousFramesContext || "No previous screens"}

          THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these):
          ${fullThemeCSS}

        CRITICAL REQUIREMENTS A MUST - READ CAREFULLY:
        ${
          allPreviousFrames.length > 0
            ? `
        - **CONSISTENCY IS CRITICAL: The new screen MUST match the existing screens exactly in style
        - **COPY the EXACT same fonts, font sizes, and font weights from existing screens
        - **COPY the EXACT same color palette - do NOT use different shades or tones
        - **COPY the EXACT bottom navigation component structure and styling if it exists - do NOT recreate it
        - **COPY the EXACT header/toolbar structure and styling if it exists
        - **COPY common components (cards, buttons, headers, inputs) and their EXACT styling
        - **Maintain the EXACT same visual hierarchy, spacing patterns, padding, and margins
        - **Use the EXACT same border radius, shadows, and other visual effects
        - **This screen MUST look like it was designed by the same person at the same time as the existing screens
        - **DO NOT introduce new design patterns, fonts, or styling that doesn't exist in previous screens
        `
            : "- **This is the first screen - establish a consistent design system"
        }

        1. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        2. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        3. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        4. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        5. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        6. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        7. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        8. **Hardcode a style only if a theme variable is not needed for that element.**
        9. **Ensure iframe-friendly rendering:**
          - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        Generate the complete, production-ready HTML for this screen now
      `.trim(),
        });

        let finalHtml = result.text ?? "";
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
        finalHtml = finalHtml.replace(/```/g, "");

        //Create the frame
        const frame = await prisma.frame.create({
          data: {
            projectId,
            title: screenPlan.name,
            htmlContent: finalHtml,
          },
        });

        // Add to generatedFrames for next iteration's context
        generatedFrames.push(frame);

        await publish({
          channel: CHANNEL,
          topic: "frame.created",
          data: {
            frame: frame,
            screenId: screenPlan.id,
            projectId: projectId,
          },
        });

        return { success: true, frame: frame };
      });
    }

    await publish({
      channel: CHANNEL,
      topic: "generation.complete",
      data: {
        status: "completed",
        projectId: projectId,
      },
    });
  }
);
