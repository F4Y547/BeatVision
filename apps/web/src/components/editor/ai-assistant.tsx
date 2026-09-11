"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AiSuggestion {
  id: string;
  type: "preset" | "effect" | "mapping" | "timing";
  title: string;
  description: string;
  confidence: number;
  apply: () => void;
}

interface AiAssistantProps {
  onApplySuggestion: (suggestion: AiSuggestion) => void;
  audioFeatures?: {
    tempo: number;
    energy: number;
    danceability: number;
    valence: number;
  };
}

export function AiAssistant({
  onApplySuggestion,
  audioFeatures,
}: AiAssistantProps) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);

  const analyzeAndSuggest = useCallback(async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise((r) => setTimeout(r, 1500));

    const newSuggestions: AiSuggestion[] = [
      {
        id: "1",
        type: "preset",
        title: "Try 'Neon Pulse' preset",
        description:
          "Based on the high energy and fast tempo, this preset will create vibrant, reactive visuals.",
        confidence: 0.92,
        apply: () =>
          onApplySuggestion({
            id: "1",
            type: "preset",
            title: "Neon Pulse",
            description: "",
            confidence: 0.92,
            apply: () => {},
          }),
      },
      {
        id: "2",
        type: "effect",
        title: "Add bloom effect",
        description:
          "The bright sections would look great with increased bloom intensity.",
        confidence: 0.85,
        apply: () =>
          onApplySuggestion({
            id: "2",
            type: "effect",
            title: "Bloom",
            description: "",
            confidence: 0.85,
            apply: () => {},
          }),
      },
      {
        id: "3",
        type: "mapping",
        title: "Map bass to particle speed",
        description:
          "Strong bass hits detected - mapping to particle speed will create impactful visuals.",
        confidence: 0.88,
        apply: () =>
          onApplySuggestion({
            id: "3",
            type: "mapping",
            title: "Bass → Particles",
            description: "",
            confidence: 0.88,
            apply: () => {},
          }),
      },
      {
        id: "4",
        type: "timing",
        title: "Sync to beat grid",
        description:
          "Tight beat detection available - enable beat-synced transitions for smoother animations.",
        confidence: 0.9,
        apply: () =>
          onApplySuggestion({
            id: "4",
            type: "timing",
            title: "Beat Sync",
            description: "",
            confidence: 0.9,
            apply: () => {},
          }),
      },
    ];

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
  }, [audioFeatures, onApplySuggestion]);

  const handleChat = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 800));

    let response = "";
    const lowerInput = userMessage.toLowerCase();

    if (lowerInput.includes("bloom") || lowerInput.includes("glow")) {
      response =
        "I'll increase the bloom intensity to 1.2 and lower the threshold to 0.4 for a more pronounced glow effect. This works well with the current energy level.";
    } else if (lowerInput.includes("particle")) {
      response =
        "Increasing particle count to 2000 and speed to 1.5. The bass frequencies will now drive particle emission rate.";
    } else if (lowerInput.includes("color") || lowerInput.includes("palette")) {
      response =
        "Switching to a complementary color scheme with warm oranges and cool blues. This creates nice contrast during drops.";
    } else if (lowerInput.includes("smooth") || lowerInput.includes("slow")) {
      response =
        "Increasing smoothing to 0.9 and reducing sensitivity. The visuals will now have a more flowing, organic feel.";
    } else if (lowerInput.includes("intense") || lowerInput.includes("aggressive")) {
      response =
        "Boosting audio sensitivity to 1.5x, reducing smoothing to 0.5, and adding chromatic aberration. The visuals will be much more reactive now.";
    } else {
      response = `I understand you want to adjust the ${userMessage}. Based on the current audio analysis, I recommend trying the suggested settings. Would you like me to apply them?`;
    }

    setChatHistory((prev) => [...prev, { role: "ai", content: response }]);
  }, [chatInput]);

  const getTypeIcon = (type: AiSuggestion["type"]) => {
    switch (type) {
      case "preset":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case "effect":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case "mapping":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "timing":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white">AI Assistant</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={analyzeAndSuggest}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze & Suggest"
          )}
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Suggestions
          </p>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-start gap-3 p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer group"
              onClick={suggestion.apply}
            >
              <div className="p-1.5 rounded bg-beatvision-500/20 text-beatvision-400">
                {getTypeIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {suggestion.title}
                  </p>
                  <span className="text-[10px] text-green-400">
                    {Math.round(suggestion.confidence * 100)}% match
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {suggestion.description}
                </p>
              </div>
              <button className="p-1 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">
          Ask AI
        </p>
        <div className="h-32 overflow-y-auto space-y-2 bg-surface-2 rounded-lg p-2">
          {chatHistory.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">
              Ask me anything about your visualizer settings
            </p>
          ) : (
            chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`text-xs p-2 rounded ${
                  msg.role === "user"
                    ? "bg-beatvision-500/20 text-beatvision-300 ml-8"
                    : "bg-surface-3 text-zinc-300 mr-8"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChat()}
            placeholder="e.g., Make it more intense..."
            className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
          />
          <Button variant="secondary" size="sm" onClick={handleChat}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
