"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BrandKit {
  id: string;
  name: string;
  logos: { id: string; name: string; url: string }[];
  colors: string[];
  typography: {
    primary: string;
    secondary: string;
  };
  createdAt: Date;
}

const mockBrandKits: BrandKit[] = [
  {
    id: "1",
    name: "My Brand",
    logos: [
      { id: "1", name: "Logo Primary", url: "/placeholder-logo.png" },
      { id: "2", name: "Logo Icon", url: "/placeholder-icon.png" },
    ],
    colors: ["#5c7cfa", "#818cf8", "#3b5bdb", "#ffffff"],
    typography: {
      primary: "Inter",
      secondary: "Roboto",
    },
    createdAt: new Date("2026-09-01"),
  },
];

export default function BrandKitsPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>(mockBrandKits);
  const [selectedKit, setSelectedKit] = useState<BrandKit | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createBrandKit = () => {
    const newKit: BrandKit = {
      id: crypto.randomUUID(),
      name: "New Brand Kit",
      logos: [],
      colors: ["#5c7cfa", "#818cf8"],
      typography: {
        primary: "Inter",
        secondary: "Inter",
      },
      createdAt: new Date(),
    };
    setBrandKits([...brandKits, newKit]);
    setSelectedKit(newKit);
    setIsCreating(true);
  };

  const deleteBrandKit = (id: string) => {
    setBrandKits(brandKits.filter((k) => k.id !== id));
    if (selectedKit?.id === id) {
      setSelectedKit(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Brand Kits</h1>
          <p className="text-zinc-400 mt-1">
            Manage your brand assets for consistent visualizers
          </p>
        </div>
        <Button onClick={createBrandKit}>New Brand Kit</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Kit List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Your Brand Kits</h2>
          {brandKits.map((kit) => (
            <Card
              key={kit.id}
              className={`cursor-pointer transition-colors ${
                selectedKit?.id === kit.id
                  ? "border-beatvision-500 bg-beatvision-500/5"
                  : "hover:border-white/20"
              }`}
              onClick={() => setSelectedKit(kit)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{kit.name}</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      {kit.logos.length} logos • {kit.colors.length} colors
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBrandKit(kit.id);
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Color Preview */}
                <div className="flex gap-1 mt-3">
                  {kit.colors.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {brandKits.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <p className="text-sm">No brand kits yet</p>
              <p className="text-xs mt-1">Create one to get started</p>
            </div>
          )}
        </div>

        {/* Brand Kit Editor */}
        <div className="lg:col-span-2">
          {selectedKit ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedKit.name}</CardTitle>
                  <Button variant="secondary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Brand Kit Name
                  </label>
                  <input
                    type="text"
                    value={selectedKit.name}
                    onChange={(e) =>
                      setSelectedKit({ ...selectedKit, name: e.target.value })
                    }
                    className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                {/* Logos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">
                      Logos
                    </label>
                    <Button variant="ghost" size="sm">
                      + Add Logo
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedKit.logos.map((logo) => (
                      <div
                        key={logo.id}
                        className="aspect-square rounded-lg bg-surface-2 border border-white/5 flex items-center justify-center"
                      >
                        <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    ))}
                    <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center hover:border-white/20 transition-colors">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">
                      Brand Colors
                    </label>
                    <Button variant="ghost" size="sm">
                      + Add Color
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedKit.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...selectedKit.colors];
                            newColors[i] = e.target.value;
                            setSelectedKit({ ...selectedKit, colors: newColors });
                          }}
                          className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...selectedKit.colors];
                            newColors[i] = e.target.value;
                            setSelectedKit({ ...selectedKit, colors: newColors });
                          }}
                          className="w-24 bg-surface-2 border border-white/10 rounded px-2 py-1.5 text-sm text-white font-mono"
                        />
                        <button
                          onClick={() => {
                            const newColors = selectedKit.colors.filter((_, j) => j !== i);
                            setSelectedKit({ ...selectedKit, colors: newColors });
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Typography
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400">Primary Font</label>
                      <select
                        value={selectedKit.typography.primary}
                        onChange={(e) =>
                          setSelectedKit({
                            ...selectedKit,
                            typography: { ...selectedKit.typography, primary: e.target.value },
                          })
                        }
                        className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400">Secondary Font</label>
                      <select
                        value={selectedKit.typography.secondary}
                        onChange={(e) =>
                          setSelectedKit({
                            ...selectedKit,
                            typography: { ...selectedKit.typography, secondary: e.target.value },
                          })
                        }
                        className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center py-20">
              <svg className="w-12 h-12 text-zinc-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Select a Brand Kit</h3>
              <p className="text-zinc-400 text-center max-w-sm">
                Choose a brand kit from the list or create a new one to manage your brand assets
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
