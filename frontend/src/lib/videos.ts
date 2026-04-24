import { api } from "./api";
import type { ApiVideo, Video } from "../types";
import { seedVideos } from "../data/videos";

function formatRelativeDate(dateInput: string): string {
  const timestamp = new Date(dateInput).getTime();
  if (Number.isNaN(timestamp)) return "Recently";

  const diffMs = Date.now() - timestamp;
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function mapApiVideo(video: ApiVideo): Video {
  return {
    id: `db-${video.id}`,
    title: video.title,
    thumbnail: video.thumbnailUrl || "/fallback-thumbnail.svg",
    channelName: video.channelName || video.user?.name || "Creator",
    channelAvatar:
      video.user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName || "Creator")}`,
    subscribers: "New creator",
    views: "0",
    uploadedAt: formatRelativeDate(video.createdAt),
    likes: "0K",
    description: video.description,
  };
}

export async function loadVideos(): Promise<Video[]> {
  try {
    const apiVideos = await api.get<ApiVideo[]>("/api/videos");
    return [...apiVideos.map(mapApiVideo), ...seedVideos];
  } catch {
    return seedVideos;
  }
}
