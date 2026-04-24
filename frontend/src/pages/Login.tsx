import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, API_BASE_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/login", { email, password });
      await refreshUser();
      navigate("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-800 bg-[#181818] p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.2em] text-red-400">Welcome back</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Login</h1>
        <p className="mt-2 text-sm text-zinc-400">Use your email/password or continue with Google.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-red-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-red-500"
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
          }}
          className="mt-4 w-full rounded-2xl border border-zinc-700 px-4 py-3 font-medium text-white transition hover:bg-zinc-800"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-zinc-400">
          New here?{" "}
          <Link to="/register" className="font-semibold text-white hover:text-red-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
