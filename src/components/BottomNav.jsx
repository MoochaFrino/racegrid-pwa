import { NavLink } from "react-router-dom";
import { Home, Calendar, MapPin, Users, User } from "lucide-react";

const navItems = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/schedule", label: "Jadwal", icon: Calendar },
  { to: "/circuits", label: "Sirkuit", icon: MapPin },
  { to: "/teams", label: "Tim", icon: Users },
  { to: "/profile", label: "Profil", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#18181f]/95 backdrop-blur-md border-t border-zinc-800">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-[#E10600]" : "text-zinc-400 hover:text-zinc-200"
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
