import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const CreateVideo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setThumbnailUrl(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const currentUser = await api.get("/api/auth/me");
      console.log("currentUser before creating video:", currentUser);
      await api.post("/api/videos", {
        title,
        description,
        thumbnailUrl,
      });
      navigate("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create video");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-white">
        <h1 className="text-3xl font-bold">Create video</h1>
        <p className="mt-3 text-zinc-400">Sign in first so we know which channel this upload belongs to.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 text-white lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="rounded-[28px] border border-zinc-800 bg-[#181818] p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-red-400">Creator tools</p>
        <h1 className="mt-3 text-3xl font-bold">Create video</h1>
        <p className="mt-2 text-sm text-zinc-400">Metadata only for now. Add the essentials and publish your card to the feed.</p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Video Title</label>
            <input
              value={title}
              name={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-red-500"
              placeholder="Designing a polished React dashboard"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-red-500"
              placeholder="Tell viewers what this video covers..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Thumbnail upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white"
            />
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-70"
        >
          {loading ? "Publishing..." : "Publish video"}
        </button>
      </form>

      <div className="rounded-[28px] border border-zinc-800 bg-[#181818] p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Preview</p>
        <div className="mt-4 overflow-hidden rounded-3xl bg-zinc-900">
          <img
            src={previewUrl || "/fallback-thumbnail.svg"}
            alt="Thumbnail preview"
            className="aspect-video w-full object-cover"
          />
        </div>
        <h2 className="mt-4 text-xl font-semibold">{title || "Your title will appear here"}</h2>
        <p className="mt-2 text-sm text-zinc-400">{description || "A strong description helps viewers understand why they should click."}</p>
      </div>
    </div>
  );
};

export default CreateVideo;
