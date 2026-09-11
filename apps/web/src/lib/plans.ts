export type PlanTier = "free" | "creator" | "pro" | "team" | "enterprise";

export interface PlanLimits {
  maxProjects: number;
  maxStorageGB: number;
  maxExportMinutes: number;
  maxDurationMinutes: number;
  maxResolution: string;
  maxFps: number;
  watermark: boolean;
  cloudRendering: boolean;
  brandKits: boolean;
  priorityRendering: boolean;
  apiAccess: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxProjects: 3,
    maxStorageGB: 1,
    maxExportMinutes: 10,
    maxDurationMinutes: 10,
    maxResolution: "720p",
    maxFps: 30,
    watermark: true,
    cloudRendering: false,
    brandKits: false,
    priorityRendering: false,
    apiAccess: false,
  },
  creator: {
    maxProjects: 25,
    maxStorageGB: 10,
    maxExportMinutes: 60,
    maxDurationMinutes: 30,
    maxResolution: "1080p",
    maxFps: 60,
    watermark: false,
    cloudRendering: true,
    brandKits: false,
    priorityRendering: false,
    apiAccess: false,
  },
  pro: {
    maxProjects: -1, // unlimited
    maxStorageGB: 100,
    maxExportMinutes: 500,
    maxDurationMinutes: 60,
    maxResolution: "4k",
    maxFps: 60,
    watermark: false,
    cloudRendering: true,
    brandKits: true,
    priorityRendering: true,
    apiAccess: true,
  },
  team: {
    maxProjects: -1,
    maxStorageGB: 500,
    maxExportMinutes: 2000,
    maxDurationMinutes: 120,
    maxResolution: "4k",
    maxFps: 60,
    watermark: false,
    cloudRendering: true,
    brandKits: true,
    priorityRendering: true,
    apiAccess: true,
  },
  enterprise: {
    maxProjects: -1,
    maxStorageGB: -1,
    maxExportMinutes: -1,
    maxDurationMinutes: -1,
    maxResolution: "4k",
    maxFps: 60,
    watermark: false,
    cloudRendering: true,
    brandKits: true,
    priorityRendering: true,
    apiAccess: true,
  },
};

export function getPlanLimits(tier: PlanTier): PlanLimits {
  return PLAN_LIMITS[tier] || PLAN_LIMITS.free;
}

export function canPerformAction(
  tier: PlanTier,
  action: string,
  currentUsage: number
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(tier);

  switch (action) {
    case "create_project":
      if (limits.maxProjects === -1) return { allowed: true };
      if (currentUsage >= limits.maxProjects) {
        return {
          allowed: false,
          reason: `You've reached the limit of ${limits.maxProjects} projects. Upgrade to create more.`,
        };
      }
      return { allowed: true };

    case "export":
      // Check is done separately based on export duration
      return { allowed: true };

    case "use_4k":
      if (limits.maxResolution !== "4k" && limits.maxResolution !== "1440p") {
        return {
          allowed: false,
          reason: "4K export requires Pro plan or higher.",
        };
      }
      return { allowed: true };

    case "use_60fps":
      if (limits.maxFps < 60) {
        return {
          allowed: false,
          reason: "60 FPS export requires Creator plan or higher.",
        };
      }
      return { allowed: true };

    case "cloud_render":
      if (!limits.cloudRendering) {
        return {
          allowed: false,
          reason: "Cloud rendering requires Creator plan or higher.",
        };
      }
      return { allowed: true };

    case "brand_kit":
      if (!limits.brandKits) {
        return {
          allowed: false,
          reason: "Brand kits require Pro plan or higher.",
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

export function getWatermarkRequired(tier: PlanTier): boolean {
  return getPlanLimits(tier).watermark;
}

export function getMaxResolution(tier: PlanTier): string {
  return getPlanLimits(tier).maxResolution;
}

export function getMaxFps(tier: PlanTier): number {
  return getPlanLimits(tier).maxFps;
}
