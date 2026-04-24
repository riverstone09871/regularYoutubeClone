import React, { useEffect, useState } from "react";
import VideoCard from "../components/Videocard";
import { loadVideos } from "../lib/videos";
import type { Video } from "../types";

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    void loadVideos().then(setVideos);
  }, []);

  return (
    <div className="w-full px-4 py-8 text-white">
      <section className="mb-8 rounded-[32px] border border-zinc-800 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.22),_transparent_34%),linear-gradient(135deg,#181818,#0f0f0f)] p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-red-400">Fresh uploads</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight">
          A simplified YouTube clone with creator tools, auth, and live backend data.
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Browse featured videos, jump into the watch experience, and create your own metadata-driven uploads.
        </p>
      </section>

      <div className="mb-5 flex flex-wrap gap-3">
        {["All", "React", "Design", "Backend", "Cloud", "System Design"].map((chip) => (
          <span key={chip} className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200">
            {chip}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Home;
