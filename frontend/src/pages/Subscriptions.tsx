import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VideoCard from "../components/Videocard";
import { api } from "../lib/api";
import { loadVideos } from "../lib/videos";
import { useAuth } from "../context/AuthContext";
import type { Video } from "../types";

type SubscriptionResponse = {
  userId: number;
  subscribedChannelIds: string[];
};

const Subscriptions = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const allVideos = await loadVideos();
      setVideos(allVideos);

      if (user) {
        try {
          const response = await api.get<SubscriptionResponse>("/api/subscriptions");
          setSubscribedChannelIds(response.subscribedChannelIds);
        } catch {
          setSubscribedChannelIds([]);
        }
      }

      setLoading(false);
    };

    void run();
  }, [user]);

  const subscribedVideos = useMemo(
    () => videos.filter((video) => subscribedChannelIds.includes(video.channelName)),
    [videos, subscribedChannelIds],
  );

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-white">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="mt-3 text-zinc-400">Sign in to save channels and build a custom feed.</p>
        <Link to="/login" className="mt-6 inline-flex rounded-full bg-red-500 px-5 py-3 font-semibold hover:bg-red-400">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 text-white">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-red-400">Your feed</p>
        <h1 className="mt-3 text-3xl font-bold">Subscriptions</h1>
        <p className="mt-2 text-zinc-400">Channels you follow show up here with their latest videos.</p>
      </div>

      {loading ? <p className="text-zinc-400">Loading subscriptions...</p> : null}
      {!loading && subscribedVideos.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-[#181818] p-8 text-zinc-300">
          Subscribe to a channel from the watch page to see videos here.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subscribedVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
