import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateAiPreset,
  suggestPresetFromAudio,
  AiPresetRequestSchema,
} from "@/lib/ai-preset-generator";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, audioFeatures, ...presetRequest } = body;

    let generatedPreset;

    if (action === "suggest-from-audio" && audioFeatures) {
      // Auto-suggest preset based on audio analysis
      const suggestedRequest = suggestPresetFromAudio(audioFeatures);
      generatedPreset = await generateAiPreset(suggestedRequest);
    } else {
      // Generate based on explicit parameters
      const validatedRequest = AiPresetRequestSchema.parse(presetRequest);
      generatedPreset = await generateAiPreset(validatedRequest);
    }

    return NextResponse.json({ preset: generatedPreset });
  } catch (error: any) {
    console.error("AI preset generation error:", error);

    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for available options
export async function GET() {
  return NextResponse.json({
    moods: ["energetic", "calm", "dark", "uplifting", "aggressive", "dreamy", "retro", "futuristic"],
    genres: ["edm", "hiphop", "rock", "pop", "jazz", "classical", "ambient", "lofi"],
    colorPreferences: ["warm", "cool", "neon", "pastel", "monochrome", "rainbow"],
    complexities: ["simple", "moderate", "complex"],
  });
}
