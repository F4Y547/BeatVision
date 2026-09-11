"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CommunityPreset {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar?: string;
  downloads: number;
  rating: number;
  tags: string[];
  thumbnail?: string;
  isPremium: boolean;
  price?: number;
}

const MOCK_PRESETS: CommunityPreset[] = [
  {
    id: "1",
    name: "Neon Dreams",
    description: "Vibrant neon colors with smooth transitions",
    author: "VisualArtist",
    downloads: 15234,
    rating: 4.8,
    tags: ["neon", "vibrant", "smooth"],
    isPremium: false,
  },
  {
    id: "2",
    name: "Cinematic Epic",
    description: "Movie-like dramatic visual style",
    author: "ProEditor",
    downloads: 8921,
    rating: 4.9,
    tags: ["cinematic", "dramatic", "epic"],
    isPremium: true,
    price: 4.99,
  },
  {
    id: "3",
    name: "Lo-Fi Vibes",
    description: "Chill lo-fi aesthetic with grain",
    author: "ChillCreator",
    downloads: 23456,
    rating: 4.7,
    tags: ["lofi", "chill", "vintage"],
    isPremium: false,
  },
  {
    id: "4",
    name: "Glitch Master",
    description: "Intense glitch effects for EDM",
    author: "GlitchArtist",
    downloads: 12789,
    rating: 4.6,
    tags: ["glitch", "edm", "intense"],
    isPremium: false,
  },
  {
    id: "5",
    name: "Organic Flow",
    description: "Natural flowing particles",
    author: "NatureViz",
    downloads: 6543,
    rating: 4.5,
    tags: ["organic", "flow", "natural"],
    isPremium: true,
    price: 2.99,
  },
  {
    id: "6",
    name: "Retro Wave",
    description: "80s synthwave aesthetic",
    author: "RetroFan",
    downloads: 19876,
    rating: 4.8,
    tags: ["retro", "synthwave", "80s"],
    isPremium: false,
  },
];

const CATEGORIES = ["All", "Trending", "New", "Free", "Premium", "EDM", "Lo-Fi", "Cinematic"];

interface CommunityPresetsProps {
  onSelect?: (preset: CommunityPreset) => void;
  onClose?: () => void;
}

export function CommunityPresets({ onSelect, onClose }: CommunityPresetsProps) {
  const [presets, setPresets] = useState<CommunityPreset[]>(MOCK_PRESETS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "newest">("popular");

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Free" && !preset.isPremium) ||
      (selectedCategory === "Premium" && preset.isPremium) ||
      preset.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    const matchesSearch =
      searchQuery === "" ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedPresets = [...filteredPresets].sort((a, b) => {
    if (sortBy === "popular") return b.downloads - a.downloads;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const formatNumber = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Community Presets</h2>
        {onClose && (
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search and Sort */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-2 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-beatvision-600 text-white"
                : "bg-surface-2 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sortedPresets.map((preset) => (
          <Card
            key={preset.id}
            className="p-3 hover:border-beatvision-500/50 transition-colors cursor-pointer group"
            onClick={() => onSelect?.(preset)}
          >
            {/* Thumbnail placeholder */}
            <div className="aspect-video bg-surface-3 rounded-lg mb-3 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-white truncate">
                  {preset.name}
                </h3>
                {preset.isPremium && (
                  <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 line-clamp-1">
                {preset.description}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {formatNumber(preset.downloads)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {preset.rating}
                </span>
                <span>by {preset.author}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {preset.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-surface-3 rounded text-[10px] text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Price / Install */}
            <div className="mt-3">
              {preset.isPremium ? (
                <Button size="sm" className="w-full" variant="secondary">
                  ${preset.price}
                </Button>
              ) : (
                <Button size="sm" className="w-full">
                  Install Free
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {sortedPresets.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p>No presets found</p>
        </div>
      )}
    </div>
  );
}
