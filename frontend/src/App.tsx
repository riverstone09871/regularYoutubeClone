import type { FC } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Channel from "./pages/Channel";
import CreateVideo from "./pages/CreateVideo";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscriptions from "./pages/Subscriptions";
import Watch from "./pages/Watch";

const AppLayout = () => {
  const location = useLocation();
  const authScreen = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <div className="mx-auto flex max-w-[1500px]">
        {!authScreen ? <Sidebar /> : null}
        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/channel/:name" element={<Channel />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/create-video" element={<CreateVideo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
