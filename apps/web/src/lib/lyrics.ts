export interface LyricLine {
  id: string;
  startTime: number; // seconds
  endTime: number;
  text: string;
  translation?: string;
}

export interface LyricsData {
  lines: LyricLine[];
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    language?: string;
  };
}

export function parseLrc(lrcContent: string): LyricsData {
  const lines: LyricLine[] = [];
  const metadata: LyricsData["metadata"] = {};

  const lrcLines = lrcContent.split("\n");

  for (const line of lrcLines) {
    // Parse metadata
    if (line.startsWith("[ti:")) {
      metadata.title = line.slice(4, -1);
      continue;
    }
    if (line.startsWith("[ar:")) {
      metadata.artist = line.slice(4, -1);
      continue;
    }
    if (line.startsWith("[al:")) {
      metadata.album = line.slice(4, -1);
      continue;
    }
    if (line.startsWith("[lang:")) {
      metadata.language = line.slice(6, -1);
      continue;
    }

    // Parse timestamp and text
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, "0"));
      const text = match[4].trim();

      if (text) {
        const startTime = minutes * 60 + seconds + milliseconds / 1000;
        lines.push({
          id: crypto.randomUUID(),
          startTime,
          endTime: startTime + 3, // Default 3 second duration, will be adjusted
          text,
        });
      }
    }
  }

  // Adjust end times
  for (let i = 0; i < lines.length - 1; i++) {
    lines[i].endTime = lines[i + 1].startTime;
  }
  if (lines.length > 0) {
    lines[lines.length - 1].endTime = lines[lines.length - 1].startTime + 3;
  }

  return { lines, metadata };
}

export function parseSrt(srtContent: string): LyricsData {
  const lines: LyricLine[] = [];
  const blocks = srtContent.split(/\n\n+/);

  for (const block of blocks) {
    const blockLines = block.trim().split("\n");
    if (blockLines.length >= 3) {
      const timeMatch = blockLines[1].match(
        /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
      );

      if (timeMatch) {
        const startTime =
          parseInt(timeMatch[1]) * 3600 +
          parseInt(timeMatch[2]) * 60 +
          parseInt(timeMatch[3]) +
          parseInt(timeMatch[4]) / 1000;
        const endTime =
          parseInt(timeMatch[5]) * 3600 +
          parseInt(timeMatch[6]) * 60 +
          parseInt(timeMatch[7]) +
          parseInt(timeMatch[8]) / 1000;
        const text = blockLines.slice(2).join("\n").trim();

        if (text) {
          lines.push({
            id: crypto.randomUUID(),
            startTime,
            endTime,
            text,
          });
        }
      }
    }
  }

  return { lines };
}

export function parseVtt(vttContent: string): LyricsData {
  const lines: LyricLine[] = [];

  // Remove WEBVTT header
  const content = vttContent.replace(/^WEBVTT[\s\S]*?\n\n/, "");
  const blocks = content.split(/\n\n+/);

  for (const block of blocks) {
    const blockLines = block.trim().split("\n");
    if (blockLines.length >= 2) {
      const timeMatch = blockLines[0].match(
        /(\d{2}):(\d{2}):(\d{2})[.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.](\d{3})/
      );

      if (timeMatch) {
        const startTime =
          parseInt(timeMatch[1]) * 3600 +
          parseInt(timeMatch[2]) * 60 +
          parseInt(timeMatch[3]) +
          parseInt(timeMatch[4]) / 1000;
        const endTime =
          parseInt(timeMatch[5]) * 3600 +
          parseInt(timeMatch[6]) * 60 +
          parseInt(timeMatch[7]) +
          parseInt(timeMatch[8]) / 1000;
        const text = blockLines.slice(1).join("\n").trim();

        if (text) {
          lines.push({
            id: crypto.randomUUID(),
            startTime,
            endTime,
            text,
          });
        }
      }
    }
  }

  return { lines };
}

export function parseAss(assContent: string): LyricsData {
  const lines: LyricLine[] = [];
  const assLines = assContent.split("\n");

  let inEvents = false;
  let formatFields: string[] = [];

  for (const line of assLines) {
    if (line.startsWith("[Events]")) {
      inEvents = true;
      continue;
    }
    if (line.startsWith("[")) {
      inEvents = false;
      continue;
    }

    if (!inEvents) continue;

    if (line.startsWith("Format:")) {
      formatFields = line.slice(7).split(",").map((f) => f.trim());
      continue;
    }

    if (line.startsWith("Dialogue:")) {
      const values = line.slice(9).split(",");
      const textIndex = formatFields.indexOf("Text");
      const startIdx = formatFields.indexOf("Start");
      const endIdx = formatFields.indexOf("End");

      if (textIndex !== -1 && startIdx !== -1 && endIdx !== -1) {
        const text = values[textIndex]?.trim() || "";
        const startTime = parseAssTime(values[startIdx]?.trim() || "0:00:00.00");
        const endTime = parseAssTime(values[endIdx]?.trim() || "0:00:00.00");

        // Clean text from ASS style tags
        const cleanText = text
          .replace(/\{[^}]*\}/g, "")
          .replace(/\\N/g, "\n")
          .replace(/\\n/g, "\n")
          .trim();

        if (cleanText) {
          lines.push({
            id: crypto.randomUUID(),
            startTime,
            endTime,
            text: cleanText,
          });
        }
      }
    }
  }

  return { lines };
}

function parseAssTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d{2}):(\d{2})[.](\d{2})/);
  if (!match) return 0;
  return (
    parseInt(match[1]) * 3600 +
    parseInt(match[2]) * 60 +
    parseInt(match[3]) +
    parseInt(match[4]) / 100
  );
}

export function generateLrc(data: LyricsData): string {
  let lrc = "";

  if (data.metadata) {
    if (data.metadata.title) lrc += `[ti:${data.metadata.title}]\n`;
    if (data.metadata.artist) lrc += `[ar:${data.metadata.artist}]\n`;
    if (data.metadata.album) lrc += `[al:${data.metadata.album}]\n`;
  }

  for (const line of data.lines) {
    const minutes = Math.floor(line.startTime / 60);
    const seconds = Math.floor(line.startTime % 60);
    const milliseconds = Math.floor((line.startTime % 1) * 100);
    lrc += `[${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}]${line.text}\n`;
  }

  return lrc;
}

export function getCurrentLine(
  lyrics: LyricsData,
  currentTime: number
): LyricLine | null {
  return (
    lyrics.lines.find(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    ) || null
  );
}

export function getUpcomingLines(
  lyrics: LyricsData,
  currentTime: number,
  count: number = 3
): LyricLine[] {
  return lyrics.lines
    .filter((line) => line.startTime > currentTime)
    .slice(0, count);
}
