import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageCircleReply, Share2, ThumbsDown, ThumbsUp, UserPlus2 } from "lucide-react";
import { api, API_BASE_URL } from "../lib/api";
import { loadVideos } from "../lib/videos";
import { useAuth } from "../context/AuthContext";
import type { Video, VideoComment } from "../types";

type SubscriptionResponse = {
  subscribed: boolean;
  subscribedChannelIds: string[];
};

type CommentMap = Record<number, VideoComment[]>;

const organizeComments = (comments: VideoComment[]): CommentMap =>
  comments.reduce<CommentMap>((accumulator, comment) => {
    const key = comment.parentCommentId ?? 0;
    accumulator[key] = [...(accumulator[key] ?? []), comment];
    return accumulator;
  }, {});

const Watch: React.FC = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [videos, setVideos] = useState<Video[]>([]);
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [commentError, setCommentError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  useEffect(() => {
    void loadVideos().then((loadedVideos) => {
      setVideos(loadedVideos);
      setVideo(loadedVideos.find((entry) => entry.id === videoId) ?? null);
    });
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;

    void api
      .get<VideoComment[]>(`/api/comments/${videoId}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [videoId]);

  useEffect(() => {
    if (!video?.likes) return;
    const likeCount = Number.parseInt(video.likes.replace("K", ""), 10);
    setLikes(Number.isNaN(likeCount) ? 0 : likeCount * 1000);
  }, [video]);

  useEffect(() => {
    if (!user || !video) {
      setSubscribed(false);
      return;
    }

    void api
      .get<{ subscribedChannelIds: string[] }>("/api/subscriptions")
      .then((response) => setSubscribed(response.subscribedChannelIds.includes(video.channelName)))
      .catch(() => setSubscribed(false));
  }, [user, video]);

  const commentTree = useMemo(() => organizeComments(comments), [comments]);
  const rootComments = commentTree[0] ?? [];
  const recommendedVideos = videos.filter((entry) => entry.id !== video?.id).slice(0, 5);

  const handleSubscribe = async () => {
    if (!video) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const response = await api.post<SubscriptionResponse>(`/api/subscriptions/${encodeURIComponent(video.channelName)}`);
    setSubscribed(response.subscribed);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !videoId) return;
    setCommentError("");

    try {
      const newComment = await api.post<VideoComment>("/api/comments", {
        videoId,
        text: comment,
        parentCommentId: null,
      });
      setComments((previous) => [newComment, ...previous]);
      setComment("");
    } catch {
      setCommentError("Please sign in before commenting.");
      if (!user) navigate("/login");
    }
  };

  const handleReplySubmit = async (parentCommentId: number) => {
    const replyText = replyDrafts[parentCommentId];
    if (!replyText?.trim() || !videoId) return;

    try {
      const newReply = await api.post<VideoComment>(`/api/comments/${parentCommentId}/reply`, {
        videoId,
        text: replyText,
      });
      setComments((previous) => [newReply, ...previous]);
      setReplyDrafts((previous) => ({ ...previous, [parentCommentId]: "" }));
      setReplyTo(null);
    } catch {
      setCommentError("Please sign in before replying.");
      if (!user) navigate("/login");
    }
  };

  const updateCommentReaction = async (commentId: number, action: "like" | "dislike") => {
    const updatedComment = await api.post<VideoComment>(`/api/comments/${commentId}/${action}`);
    setComments((previous) => previous.map((entry) => (entry.id === updatedComment.id ? updatedComment : entry)));
  };

  const renderCommentBranch = (entries: VideoComment[], depth = 0) =>
    entries.map((entry) => {
      const replies = commentTree[entry.id] ?? [];

      return (
        <div key={entry.id} className={`${depth > 0 ? "ml-8 border-l border-zinc-800 pl-5" : ""}`}>
          <div className="flex gap-3">
            <img
              src={entry.user?.picture || "https://ui-avatars.com/api/?name=Viewer&background=27272a&color=fff"}
              alt={entry.user?.name || "Viewer"}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">{entry.user?.name || "Anonymous"}</span>
                <span className="text-xs text-zinc-500">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{entry.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <button
                  type="button"
                  onClick={() => void updateCommentReaction(entry.id, "like")}
                  aria-label={`Like comment ${entry.id}`}
                  className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-zinc-800 hover:text-white"
                >
                  <ThumbsUp size={16} />
                  {entry.likes}
                </button>
                <button
                  type="button"
                  onClick={() => void updateCommentReaction(entry.id, "dislike")}
                  aria-label={`Dislike comment ${entry.id}`}
                  className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-zinc-800 hover:text-white"
                >
                  <ThumbsDown size={16} />
                  {entry.dislikes}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyTo((current) => (current === entry.id ? null : entry.id))}
                  aria-label={`Reply to comment ${entry.id}`}
                  className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-zinc-800 hover:text-white"
                >
                  <MessageCircleReply size={16} />
                  Reply
                </button>
              </div>

              {replyTo === entry.id ? (
                <div className="mt-4 flex gap-3">
                  <input
                    value={replyDrafts[entry.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((previous) => ({
                        ...previous,
                        [entry.id]: event.target.value,
                      }))
                    }
                    placeholder="Write a reply"
                    className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleReplySubmit(entry.id)}
                    className="rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                  >
                    Post reply
                  </button>
                </div>
              ) : null}

              {replies.length > 0 ? <div className="mt-5 space-y-5">{renderCommentBranch(replies, depth + 1)}</div> : null}
            </div>
          </div>
        </div>
      );
    });

  if (!video) {
    return <div className="p-6 text-white">Loading video...</div>;
  }

  return (
    <div className="w-full bg-[#0f0f0f] px-4 py-6 text-white">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-black">
            <div className="aspect-video bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.12),_transparent_45%),linear-gradient(135deg,#111,#000)] px-8 py-10">
              <div className="flex h-full items-end rounded-[24px] border border-white/10 bg-black/40 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-red-400">Now watching</p>
                  <h2 className="mt-3 text-3xl font-bold">{video.title}</h2>
                </div>
              </div>
            </div>
          </div>

          <h1 className="mt-5 text-3xl font-bold">{video.title}</h1>

          <div className="mt-5 flex flex-col gap-4 rounded-[28px] border border-zinc-800 bg-[#181818] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <img src={video.channelAvatar} alt={video.channelName} className="h-14 w-14 rounded-full object-cover" />
              <div>
                <button
                  type="button"
                  onClick={() => navigate(`/channel/${video.channelName}`)}
                  className="text-left text-lg font-semibold hover:text-red-400"
                >
                  {video.channelName}
                </button>
                <p className="text-sm text-zinc-400">{video.subscribers} subscribers</p>
              </div>
              <button
                type="button"
                onClick={() => void handleSubscribe()}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  subscribed ? "bg-zinc-700 text-white hover:bg-zinc-600" : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                <UserPlus2 size={16} />
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setLiked((value) => !value);
                  setLikes((value) => (liked ? Math.max(0, value - 1) : value + 1));
                  if (!liked && disliked) {
                    setDisliked(false);
                    setDislikes((value) => Math.max(0, value - 1));
                  }
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
                  liked ? "bg-red-500 text-white" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <ThumbsUp size={18} />
                {likes}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDisliked((value) => !value);
                  setDislikes((value) => (disliked ? Math.max(0, value - 1) : value + 1));
                  if (!disliked && liked) {
                    setLiked(false);
                    setLikes((value) => Math.max(0, value - 1));
                  }
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
                  disliked ? "bg-zinc-600 text-white" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <ThumbsDown size={18} />
                {dislikes}
              </button>
              <button
                type="button"
                onClick={() => void handleShare()}
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-zinc-800 bg-[#181818] p-5">
            <p className="text-sm font-semibold text-zinc-200">
              {video.views} views • {video.uploadedAt}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-300">{video.description}</p>
          </div>

          <section className="mt-8 rounded-[28px] border border-zinc-800 bg-[#181818] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Comments</h2>
                <p className="mt-1 text-sm text-zinc-400">{comments.length} total messages in this thread</p>
              </div>
              {!user ? (
                <Link to="/login" className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800">
                  Sign in to comment
                </Link>
              ) : null}
            </div>

            <div className="mb-6 flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold">
                {user?.name?.[0] ?? "G"}
              </div>
              <div className="flex-1">
                <input
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add a comment..."
                  className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                />
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleAddComment()}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                  >
                    Post comment
                  </button>
                  {commentError ? <p className="self-center text-sm text-red-400">{commentError}</p> : null}
                </div>
              </div>
            </div>

            <div className="space-y-6">{renderCommentBranch(rootComments)}</div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-zinc-800 bg-[#181818] p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-red-400">Up next</p>
            <div className="mt-4 space-y-4">
              {recommendedVideos.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate(`/watch/${entry.id}`)}
                  className="flex w-full gap-3 rounded-2xl p-2 text-left transition hover:bg-zinc-900"
                >
                  <img src={entry.thumbnail} alt={entry.title} className="h-24 w-40 rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold">{entry.title}</p>
                    <p className="mt-1 text-xs text-zinc-400">{entry.channelName}</p>
                    <p className="text-xs text-zinc-500">
                      {entry.views} views • {entry.uploadedAt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!user ? (
            <div className="rounded-[28px] border border-zinc-800 bg-[#181818] p-5">
              <h3 className="text-lg font-semibold">Unlock the full experience</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Login with email/password or keep using Google Sign-In for comments, subscriptions, and uploads.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
                }}
                className="mt-4 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Continue with Google
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default Watch;
