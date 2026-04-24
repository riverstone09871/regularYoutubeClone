import React from "react";
import { useNavigate } from "react-router-dom";
import type { Video } from "../types";

interface Props {
  video: Video;
}

const VideoCard: React.FC<Props> = ({ video }) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/watch/${video.id}`)} className="group w-full cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl bg-[#1f1f1f]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 rounded-md bg-black/85 px-2 py-1 text-xs font-medium text-white">
          12:34
        </span>
      </div>

      <div className="mt-3 flex gap-3">
        <img
          src={video.channelAvatar}
          alt={video.channelName}
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="min-w-0">
          <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{video.title}</h4>
          <p className="mt-1 text-sm text-zinc-400">{video.channelName}</p>
          <p className="text-xs text-zinc-500">{video.views} views • {video.uploadedAt}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
