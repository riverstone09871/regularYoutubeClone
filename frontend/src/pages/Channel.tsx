import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoCard from "../components/Videocard";
import { loadVideos } from "../lib/videos";
import type { Video } from "../types";

const Channel = () => {
  const { name } = useParams();
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);

  useEffect(() => {
    void loadVideos().then((videos) => {
      setChannelVideos(videos.filter((video) => video.channelName === name));
    });
  }, [name]);

  return (
    <div className="w-full p-5 text-white">
      <div className="rounded-[28px] border border-zinc-800 bg-[linear-gradient(135deg,#181818,#111)] p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-red-400">Channel</p>
        <h1 className="mt-3 text-4xl font-bold">{name}</h1>
        <p className="mt-2 text-zinc-400">{channelVideos.length} videos available in this channel view.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {channelVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Channel;
