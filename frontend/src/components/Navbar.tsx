import React, { useEffect, useRef, useState } from "react";
import { CircleUserRound, LogOut, PlusSquare, Search, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, API_BASE_URL } from "../lib/api";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, refreshUser } = useAuth();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    if (user?.authProvider === "google") {
      window.location.href = `${API_BASE_URL}/logout`;
      return;
    }

    await api.post("/api/auth/logout");
    await refreshUser();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0f0f0f]/95 px-4 py-3 text-white backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 lg:gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1 hover:bg-zinc-800">
          <Play className="h-7 w-7 fill-red-500 text-red-500" />
          <span className="text-lg font-bold tracking-tight">CloneTube</span>
        </Link>

        <div className="hidden md:block md:w-52" />

        <form
          className="flex flex-1 items-center justify-center"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="flex w-full max-w-2xl items-center overflow-hidden rounded-full border border-zinc-700 bg-[#181818] shadow-inner">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search videos, channels, and more"
              className="w-full bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-full items-center justify-center border-l border-zinc-700 bg-zinc-800 px-5 py-3 transition hover:bg-zinc-700"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-2" ref={dropdownRef}>
          <Link
            to="/create-video"
            className="hidden items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium transition hover:bg-zinc-700 sm:flex"
          >
            <PlusSquare size={18} />
            Create
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <CircleUserRound className="h-6 w-6 text-zinc-300" />
            )}
          </button>

          {open && (
            <div className="absolute right-4 top-16 w-72 rounded-2xl border border-zinc-800 bg-[#181818] p-3 shadow-2xl shadow-black/40">
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-zinc-900 p-3">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800">
                    <CircleUserRound className="h-6 w-6 text-zinc-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user ? user.name : "Guest viewer"}</p>
                  <p className="truncate text-xs text-zinc-400">
                    {user ? user.email : "Sign in to create videos and comment"}
                  </p>
                </div>
              </div>

              {!user ? (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
                    }}
                    className="w-full rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-800"
                  >
                    Continue with Google
                  </button>
                  <Link
                    to="/register"
                    className="block rounded-xl border border-zinc-700 px-4 py-2 text-center text-sm font-medium transition hover:bg-zinc-800"
                    onClick={() => setOpen(false)}
                  >
                    Create account
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/subscriptions"
                    className="block rounded-xl px-4 py-2 text-sm transition hover:bg-zinc-800"
                    onClick={() => setOpen(false)}
                  >
                    Subscriptions
                  </Link>
                  <Link
                    to="/create-video"
                    className="block rounded-xl px-4 py-2 text-sm transition hover:bg-zinc-800"
                    onClick={() => setOpen(false)}
                  >
                    Create video
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm transition hover:bg-zinc-800"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
