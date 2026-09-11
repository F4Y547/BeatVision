import { db } from "@/lib/db";
import { getPlanLimits, type PlanTier } from "./plans";

export interface UsageMetrics {
  projects: { used: number; limit: number };
  storage: { usedBytes: number; limitBytes: number };
  exportMinutes: { used: number; limit: number };
}

export async function getUsageMetrics(userId: string): Promise<UsageMetrics> {
  // Get user's workspace and plan
  const workspace = await db.workspace.findFirst({
    where: { ownerId: userId },
    include: {
      projects: true,
      assets: true,
    },
  });

  if (!workspace) {
    return {
      projects: { used: 0, limit: 3 },
      storage: { usedBytes: 0, limitBytes: 1 * 1024 * 1024 * 1024 },
      exportMinutes: { used: 0, limit: 10 },
    };
  }

  // TODO: Get actual plan tier from subscription
  const tier: PlanTier = "free";
  const limits = getPlanLimits(tier);

  const projectCount = workspace.projects.length;
  const storageUsed = workspace.assets.reduce((sum, a) => sum + a.sizeBytes, 0);

  // TODO: Get actual export minutes from render jobs
  const exportMinutesUsed = 0;

  return {
    projects: {
      used: projectCount,
      limit: limits.maxProjects === -1 ? Infinity : limits.maxProjects,
    },
    storage: {
      usedBytes: storageUsed,
      limitBytes: limits.maxStorageGB * 1024 * 1024 * 1024,
    },
    exportMinutes: {
      used: exportMinutesUsed,
      limit: limits.maxExportMinutes === -1 ? Infinity : limits.maxExportMinutes,
    },
  };
}

export async function canCreateProject(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const metrics = await getUsageMetrics(userId);
  
  if (metrics.projects.limit !== Infinity && metrics.projects.used >= metrics.projects.limit) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${metrics.projects.limit} projects. Upgrade to create more.`,
    };
  }
  
  return { allowed: true };
}

export async function canExport(
  userId: string,
  durationSeconds: number
): Promise<{ allowed: boolean; reason?: string }> {
  const metrics = await getUsageMetrics(userId);
  const exportMinutesNeeded = durationSeconds / 60;
  
  if (metrics.exportMinutes.limit !== Infinity) {
    const remaining = metrics.exportMinutes.limit - metrics.exportMinutes.used;
    if (exportMinutesNeeded > remaining) {
      return {
        allowed: false,
        reason: `Not enough export minutes remaining. You have ${Math.floor(remaining)} minutes left.`,
      };
    }
  }
  
  return { allowed: true };
}

export async function canUploadAsset(
  userId: string,
  fileSizeBytes: number
): Promise<{ allowed: boolean; reason?: string }> {
  const metrics = await getUsageMetrics(userId);
  
  if (metrics.storage.limitBytes !== Infinity) {
    const remaining = metrics.storage.limitBytes - metrics.storage.usedBytes;
    if (fileSizeBytes > remaining) {
      const remainingMB = Math.floor(remaining / (1024 * 1024));
      return {
        allowed: false,
        reason: `Not enough storage remaining. You have ${remainingMB}MB left.`,
      };
    }
  }
  
  return { allowed: true };
}

export async function recordExportUsage(
  userId: string,
  durationSeconds: number
): Promise<void> {
  // TODO: Record export usage in database
  console.log(`Recording ${durationSeconds}s export usage for user ${userId}`);
}
