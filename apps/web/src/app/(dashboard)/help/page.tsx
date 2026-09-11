"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Getting Started",
    question: "How do I create my first visualizer?",
    answer: "Click 'New Project' from the dashboard, upload an audio file and artwork, then select a preset to get started. The visualizer will automatically sync to your music.",
  },
  {
    category: "Getting Started",
    question: "What audio formats are supported?",
    answer: "BeatVision supports MP3, WAV, OGG, M4A, FLAC, and WebM audio formats. For best results, we recommend using high-quality MP3 (320kbps) or WAV files.",
  },
  {
    category: "Getting Started",
    question: "What image formats can I upload?",
    answer: "You can upload PNG, JPG, JPEG, WebP, and SVG files. PNG with transparency works best for logo overlays. Maximum file size is 50MB for images.",
  },
  {
    category: "Editor",
    question: "How do I sync visuals to my music?",
    answer: "BeatVision automatically analyzes your audio and detects beats. You can adjust the sensitivity and smoothing in the Audio Mapping panel. For manual control, use the beat markers on the timeline.",
  },
  {
    category: "Editor",
    question: "Can I use multiple visual layers?",
    answer: "Yes! Use the Layer Panel to add multiple layers like circular spectrum, particle fields, and logo effects. Each layer can be independently controlled and reordered.",
  },
  {
    category: "Editor",
    question: "How do I change colors?",
    answer: "Colors can be extracted from your artwork automatically, or you can set custom colors in the Color Palette section. Each layer supports its own color scheme.",
  },
  {
    category: "Export",
    question: "What export quality should I use?",
    answer: "For social media, 1080p at 30fps is usually sufficient. For YouTube or professional use, try 4K at 60fps. Higher quality means longer render times.",
  },
  {
    category: "Export",
    question: "Why is my export taking so long?",
    answer: "Export time depends on video length, resolution, and complexity. A 3-minute 1080p video typically takes 5-10 minutes. Keep the browser tab active during export.",
  },
  {
    category: "Export",
    question: "Can I export in different aspect ratios?",
    answer: "Yes! Choose from Landscape (16:9), Portrait (9:16), Square (1:16), or custom dimensions. Different presets optimize for each ratio.",
  },
  {
    category: "Account",
    question: "How do I upgrade my plan?",
    answer: "Go to Settings > Billing to view and upgrade your subscription plan. Upgrades take effect immediately with prorated billing.",
  },
  {
    category: "Account",
    question: "What happens when I reach my storage limit?",
    answer: "You'll receive a warning when approaching your limit. Once reached, you can't upload new files until you upgrade or delete existing assets.",
  },
  {
    category: "Troubleshooting",
    question: "The visualizer is lagging",
    answer: "Try reducing the particle count, lowering the canvas resolution, or closing other browser tabs. WebGL performance varies by device.",
  },
  {
    category: "Troubleshooting",
    question: "My export failed",
    answer: "Export failures can happen due to browser memory limits. Try exporting a shorter section, lowering resolution, or using Chrome for best results.",
  },
];

const CATEGORIES = ["All", "Getting Started", "Editor", "Export", "Account", "Troubleshooting"];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Find answers to common questions or reach out to our support team
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-beatvision-500/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-beatvision-500/20">
              <svg className="w-6 h-6 text-beatvision-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Documentation</h3>
              <p className="text-xs text-zinc-500">Detailed guides and tutorials</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-beatvision-500/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">FAQ</h3>
              <p className="text-xs text-zinc-500">Common questions answered</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-beatvision-500/50 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Contact Support</h3>
              <p className="text-xs text-zinc-500">Get help from our team</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-1 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-beatvision-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-beatvision-600 text-white"
                : "bg-surface-1 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => (
          <Card
            key={index}
            className="overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedItem(
                  expandedItem === item.question ? null : item.question
                )
              }
              className="w-full p-4 text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 bg-surface-2 px-2 py-1 rounded">
                  {item.category}
                </span>
                <span className="font-medium">{item.question}</span>
              </div>
              <svg
                className={`w-5 h-5 text-zinc-400 transition-transform ${
                  expandedItem === item.question ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedItem === item.question && (
              <div className="px-4 pb-4 text-sm text-zinc-400 border-t border-white/5 pt-3">
                {item.answer}
              </div>
            )}
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p>No results found for "{searchQuery}"</p>
            <p className="text-sm mt-2">Try different keywords or browse categories</p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <Card className="text-center">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
          <p className="text-zinc-400 mb-6">
            Our support team is here to help you with any questions or issues
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-beatvision-600 hover:bg-beatvision-700 text-white font-medium rounded-xl transition-colors">
              Contact Support
            </button>
            <button className="px-6 py-3 bg-surface-2 hover:bg-surface-3 text-zinc-300 font-medium rounded-xl transition-colors border border-white/10">
              Join Community
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
