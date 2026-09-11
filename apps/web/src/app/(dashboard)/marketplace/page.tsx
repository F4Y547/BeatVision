"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  price: number;
  rating: number;
  downloads: number;
  tags: string[];
  category: "preset" | "template" | "effect" | "pack";
  thumbnail?: string;
  isInstalled?: boolean;
}

const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: "1",
    name: "Neon Dreams Collection",
    description: "10 vibrant neon presets perfect for EDM and synthwave tracks",
    author: "VisualArtist",
    price: 9.99,
    rating: 4.9,
    downloads: 12500,
    tags: ["neon", "edm", "synthwave"],
    category: "pack",
  },
  {
    id: "2",
    name: "Cinematic Transitions Pack",
    description: "Professional cinematic transition effects for your visualizers",
    author: "ProEditor",
    price: 14.99,
    rating: 4.8,
    downloads: 8900,
    tags: ["cinematic", "transitions", "professional"],
    category: "effect",
  },
  {
    id: "3",
    name: "Lo-Fi Vibes Bundle",
    description: "Chill lo-fi aesthetic presets with vintage grain effects",
    author: "ChillCreator",
    price: 0,
    rating: 4.7,
    downloads: 23400,
    tags: ["lofi", "chill", "vintage"],
    category: "preset",
  },
  {
    id: "4",
    name: "Social Media Templates",
    description: "Ready-to-use templates for Instagram, TikTok, and YouTube Shorts",
    author: "SocialPro",
    price: 19.99,
    rating: 4.6,
    downloads: 15600,
    tags: ["social", "templates", "instagram"],
    category: "template",
  },
  {
    id: "5",
    name: "Glitch Master Effects",
    description: "Intense glitch and distortion effects for high-energy tracks",
    author: "GlitchArtist",
    price: 7.99,
    rating: 4.8,
    downloads: 9800,
    tags: ["glitch", "effects", "intense"],
    category: "effect",
  },
  {
    id: "6",
    name: "Organic Nature Pack",
    description: "Flowing, natural particle effects inspired by nature",
    author: "NatureViz",
    price: 0,
    rating: 4.5,
    downloads: 6700,
    tags: ["organic", "nature", "particles"],
    category: "preset",
  },
  {
    id: "7",
    name: "Professional Music Video Kit",
    description: "Complete toolkit for creating music video visualizers",
    author: "StudioPro",
    price: 29.99,
    rating: 4.9,
    downloads: 4500,
    tags: ["professional", "music video", "complete"],
    category: "pack",
  },
  {
    id: "8",
    name: "Minimalist Collection",
    description: "Clean, minimalist presets for modern aesthetics",
    author: "MinimalDesign",
    price: 4.99,
    rating: 4.7,
    downloads: 11200,
    tags: ["minimal", "clean", "modern"],
    category: "preset",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "preset", label: "Presets" },
  { id: "template", label: "Templates" },
  { id: "effect", label: "Effects" },
  { id: "pack", label: "Packs" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "rating", label: "Highest Rated" },
  { id: "newest", label: "Newest" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>(MOCK_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  const filteredItems = items
    .filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads;
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const handlePurchase = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item && item.price === 0) {
      setPurchasedItems((prev) => [...prev, itemId]);
    }
    // In production, this would open a payment flow
  };

  const formatDownloads = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-zinc-400 mt-1">
            Discover presets, templates, and effects from the community
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Sell Your Work</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
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
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-1 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-surface-1 border border-white/10 rounded-xl px-4 py-2.5 text-white"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-beatvision-600 text-white"
                : "bg-surface-1 text-zinc-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="group hover:border-beatvision-500/50 transition-all"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-surface-2 rounded-t-xl flex items-center justify-center relative overflow-hidden">
              <svg
                className="w-12 h-12 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {item.price === 0 && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                  FREE
                </span>
              )}
              {purchasedItems.includes(item.id) && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-beatvision-500 text-white text-xs font-medium rounded">
                  INSTALLED
                </span>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Category Badge */}
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {item.category}
              </span>

              {/* Title & Author */}
              <div>
                <h3 className="font-medium text-white truncate">{item.name}</h3>
                <p className="text-xs text-zinc-500">by {item.author}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 line-clamp-2">
                {item.description}
              </p>

              {/* Tags */}
              <div className="flex gap-1 flex-wrap">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-surface-2 rounded text-[10px] text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {item.rating}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {formatDownloads(item.downloads)}
                </span>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-lg font-bold">
                  {item.price === 0 ? "Free" : `$${item.price}`}
                </span>
                {purchasedItems.includes(item.id) ? (
                  <Button size="sm" variant="secondary">
                    Installed
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(item.id)}
                  >
                    {item.price === 0 ? "Install" : "Buy Now"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg">No items found</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
