/**
 * Watch page async helpers — five distinct Promise techniques:
 * - new Promise: explicit timer used with race/abort cleanup.
 * - Promise.race: comments vs timeout so a hung thread does not block the page.
 * - Promise.all: catalog + comments in parallel (fewer sequential round trips).
 * - Promise.allSettled: subscriptions + session probe; partial failures still yield useful UI bits.
 * - Promise.resolve().then: defer sessionStorage work off the hot path.
 */
import type { AuthUser, Video, VideoComment } from "../types";

const LAST_WATCHED_KEY = "yt-clone:lastWatchId";

export type WatchGet = <T>(path: string, init?: RequestInit) => Promise<T>;

export type WatchInitialDeps = {
  loadVideos: () => Promise<Video[]>;
  get: WatchGet;
};

/**
 * 1) new Promise — timer branch for the race below; rejects when the budget is exceeded or navigation aborts.
 * 2) Promise.race — whichever settles first wins; the fetch branch clears the timer in `finally` so timers do not leak.
 */
export async function fetchCommentsWithTimeout(
  get: WatchGet,
  videoId: string,
  ms: number,
  signal?: AbortSignal,
): Promise<VideoComment[]> {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);

    const onAbort = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });

  const fetchPromise = get<VideoComment[]>(`/api/comments/${videoId}`, { signal }).finally(() => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  });

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return [];
  }
}

/**
 * Promise.all — loads the catalog and the comment thread together instead of serializing two round trips.
 */
export async function loadCatalogAndCommentsInParallel(
  videoId: string,
  deps: WatchInitialDeps,
  options?: { commentTimeoutMs?: number; signal?: AbortSignal },
): Promise<{ videos: Video[]; video: Video | null; comments: VideoComment[] }> {
  const { commentTimeoutMs = 12_000, signal } = options ?? {};
  const [videos, comments] = await Promise.all([
    deps.loadVideos(),
    fetchCommentsWithTimeout(deps.get, videoId, commentTimeoutMs, signal),
  ]);
  const video = videos.find((entry) => entry.id === videoId) ?? null;
  return { videos, video, comments };
}

export type SubscriptionPayload = { subscribedChannelIds: string[] };

/**
 * Promise.allSettled — subscription banner and session probe are independent; one 401 should not hide the other result.
 */
export async function resolveSubscriptionAndSession(
  video: Video,
  get: WatchGet,
): Promise<{ subscribed: boolean; sessionFresh: boolean }> {
  const [subscriptionsResult, meResult] = await Promise.allSettled([
    get<SubscriptionPayload>("/api/subscriptions"),
    get<AuthUser | null>("/api/auth/me"),
  ]);

  const subscribed =
    subscriptionsResult.status === "fulfilled" &&
    subscriptionsResult.value.subscribedChannelIds.includes(video.channelName);

  const sessionFresh = meResult.status === "fulfilled" && meResult.value !== null;

  return { subscribed, sessionFresh };
}

/**
 * Promise.resolve().then — schedules lightweight persistence after the current task so it never blocks paint work.
 */
export function rememberLastWatchedVideoId(videoId: string): Promise<void> {
  return Promise.resolve(videoId).then((id) => {
    try {
      sessionStorage.setItem(LAST_WATCHED_KEY, id);
    } catch {
      // Private mode / quota — ignore.
    }
  });
}

export function readLastWatchedVideoId(): string | null {
  try {
    return sessionStorage.getItem(LAST_WATCHED_KEY);
  } catch {
    return null;
  }
}
