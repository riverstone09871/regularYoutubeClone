import {
  fetchCommentsWithTimeout,
  loadCatalogAndCommentsInParallel,
  readLastWatchedVideoId,
  rememberLastWatchedVideoId,
  resolveSubscriptionAndSession,
  type WatchGet,
} from "../lib/watchPagePromises";
import type { Video } from "../types";

const sampleVideo: Video = {
  id: "1",
  title: "Demo",
  thumbnail: "/t.png",
  channelName: "CodeWithDev",
  channelAvatar: "/a.png",
  subscribers: "1",
  views: "1",
  uploadedAt: "today",
  likes: "1K",
  description: "d",
};

describe("watchPagePromises", () => {
  describe("loadCatalogAndCommentsInParallel (Promise.all)", () => {
    it("merges catalog and comments without waiting for one after the other", async () => {
      const order: string[] = [];
      const loadVideos = async () => {
        order.push("videos-start");
        await Promise.resolve();
        order.push("videos-end");
        return [sampleVideo];
      };
      const get = jest.fn(async (_path: string, _init?: RequestInit) => {
        order.push("comments");
        return [{ id: 1, videoId: "1", text: "hi", createdAt: "", parentCommentId: null, likes: 0, dislikes: 0, user: null }];
      }) as unknown as WatchGet;

      const result = await loadCatalogAndCommentsInParallel("1", { loadVideos, get }, { commentTimeoutMs: 5000 });

      expect(order).toEqual(["videos-start", "comments", "videos-end"]);
      expect(result.video).toEqual(sampleVideo);
      expect(result.comments).toHaveLength(1);
      expect(get).toHaveBeenCalledWith("/api/comments/1", expect.anything());
    });
  });

  describe("fetchCommentsWithTimeout (new Promise + Promise.race)", () => {
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("returns [] when the request outlasts the timeout budget", async () => {
      const get = jest.fn(
        (_path: string, _init?: RequestInit) =>
          new Promise<never>(() => {
            /* never resolves */
          }),
      ) as unknown as WatchGet;

      const pending = fetchCommentsWithTimeout(get, "slow", 1000);
      await Promise.resolve();
      jest.advanceTimersByTime(1000);

      await expect(pending).resolves.toEqual([]);
      expect(get).toHaveBeenCalled();
    });

    it("returns comments when the server responds before the timeout", async () => {
      const payload = [
        { id: 2, videoId: "1", text: "ok", createdAt: "", parentCommentId: null, likes: 0, dislikes: 0, user: null },
      ];
      const get = jest.fn(async (_path: string, _init?: RequestInit) => payload) as unknown as WatchGet;

      const pending = fetchCommentsWithTimeout(get, "1", 5000);
      await expect(pending).resolves.toEqual(payload);
    });
  });

  describe("resolveSubscriptionAndSession (Promise.allSettled)", () => {
    it("still derives subscription state when the session probe fails", async () => {
      const get = jest.fn(async (path: string, _init?: RequestInit) => {
        if (path === "/api/subscriptions") {
          return { subscribedChannelIds: ["CodeWithDev"] };
        }
        if (path === "/api/auth/me") {
          throw new Error("session expired");
        }
        return null;
      }) as unknown as WatchGet;

      await expect(resolveSubscriptionAndSession(sampleVideo, get)).resolves.toEqual({
        subscribed: true,
        sessionFresh: false,
      });
    });

    it("marks sessionFresh when both calls succeed", async () => {
      const get = jest.fn(async (path: string, _init?: RequestInit) => {
        if (path === "/api/subscriptions") {
          return { subscribedChannelIds: [] };
        }
        if (path === "/api/auth/me") {
          return { id: 1, name: "A", email: "a@a.com", picture: "" };
        }
        return null;
      }) as unknown as WatchGet;

      await expect(resolveSubscriptionAndSession(sampleVideo, get)).resolves.toEqual({
        subscribed: false,
        sessionFresh: true,
      });
    });
  });

  describe("rememberLastWatchedVideoId (Promise.resolve chain)", () => {
    it("persists the id for readLastWatchedVideoId", async () => {
      sessionStorage.clear();
      await rememberLastWatchedVideoId("watch-123");
      expect(readLastWatchedVideoId()).toBe("watch-123");
    });
  });
});
