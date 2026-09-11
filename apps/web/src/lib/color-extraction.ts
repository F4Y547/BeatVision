export interface ColorPalette {
  dominant: string;
  vibrant: string;
  muted: string;
  lightVibrant: string;
  darkVibrant: string;
  lightMuted: string;
  darkMuted: string;
  allColors: string[];
}

export async function extractColorsFromImage(
  imageUrl: string
): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const colors = extractColors(img);
      resolve(colors);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

function extractColors(img: HTMLImageElement): ColorPalette {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return getDefaultPalette();
  }

  // Scale down for performance
  const maxSize = 100;
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Collect colors
  const colorMap = new Map<string, number>();
  const step = 4; // Sample every 4th pixel

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 128) continue; // Skip transparent pixels

    // Quantize colors to reduce unique count
    const qr = Math.round(r / 16) * 16;
    const qg = Math.round(g / 16) * 16;
    const qb = Math.round(b / 16) * 16;

    const key = `${qr},${qg},${qb}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by frequency
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([color]) => {
      const [r, g, b] = color.split(",").map(Number);
      return { r, g, b };
    });

  if (sortedColors.length === 0) {
    return getDefaultPalette();
  }

  // Find dominant color
  const dominant = sortedColors[0];
  const dominantHex = rgbToHex(dominant.r, dominant.g, dominant.b);

  // Find vibrant (most saturated)
  const vibrant = findMostSaturated(sortedColors);
  const vibrantHex = rgbToHex(vibrant.r, vibrant.g, vibrant.b);

  // Find muted (least saturated)
  const muted = findLeastSaturated(sortedColors);
  const mutedHex = rgbToHex(muted.r, muted.g, muted.b);

  // Find light/dark variants
  const lightVibrant = adjustBrightness(vibrant, 1.3);
  const darkVibrant = adjustBrightness(vibrant, 0.6);
  const lightMuted = adjustBrightness(muted, 1.2);
  const darkMuted = adjustBrightness(muted, 0.5);

  return {
    dominant: dominantHex,
    vibrant: vibrantHex,
    muted: mutedHex,
    lightVibrant: rgbToHex(lightVibrant.r, lightVibrant.g, lightVibrant.b),
    darkVibrant: rgbToHex(darkVibrant.r, darkVibrant.g, darkVibrant.b),
    lightMuted: rgbToHex(lightMuted.r, lightMuted.g, lightMuted.b),
    darkMuted: rgbToHex(darkMuted.r, darkMuted.g, darkMuted.b),
    allColors: sortedColors.slice(0, 8).map((c) => rgbToHex(c.r, c.g, c.b)),
  };
}

function findMostSaturated(colors: { r: number; g: number; b: number }[]) {
  return colors.reduce((most, current) => {
    const satMost = getSaturation(most);
    const satCurrent = getSaturation(current);
    return satCurrent > satMost ? current : most;
  });
}

function findLeastSaturated(colors: { r: number; g: number; b: number }[]) {
  return colors.reduce((least, current) => {
    const satLeast = getSaturation(least);
    const satCurrent = getSaturation(current);
    return satCurrent < satLeast ? current : least;
  });
}

function getSaturation(color: { r: number; g: number; b: number }): number {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function adjustBrightness(
  color: { r: number; g: number; b: number },
  factor: number
) {
  return {
    r: Math.min(255, Math.round(color.r * factor)),
    g: Math.min(255, Math.round(color.g * factor)),
    b: Math.min(255, Math.round(color.b * factor)),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function getDefaultPalette(): ColorPalette {
  return {
    dominant: "#5c7cfa",
    vibrant: "#5c7cfa",
    muted: "#6b7280",
    lightVibrant: "#818cf8",
    darkVibrant: "#3b5bdb",
    lightMuted: "#9ca3af",
    darkMuted: "#374151",
    allColors: ["#5c7cfa", "#818cf8", "#3b5bdb", "#6b7280"],
  };
}

export function generateColorScheme(palette: ColorPalette): string[] {
  return [
    palette.vibrant,
    palette.lightVibrant,
    palette.darkVibrant,
    palette.muted,
  ];
}
