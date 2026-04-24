import React from "react";
import { Clapperboard, Compass, History, Home, Library, Radio, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/subscriptions", label: "Subscriptions", icon: Users },
  { to: "/create-video", label: "Create", icon: Clapperboard },
  { to: "/channel/CodeWithDev", label: "Channels", icon: Compass },
  { to: "/", label: "History", icon: History },
  { to: "/", label: "Library", icon: Library },
  { to: "/", label: "Live", icon: Radio },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 shrink-0 overflow-y-auto border-r border-zinc-800 bg-[#121212] px-3 py-5 lg:block">
      <div className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={`${to}-${label}`}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
