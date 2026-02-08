import { HiOutlineMenuAlt2 } from "react-icons/hi";
import useAuth from "../../hooks/useAuth";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white p-1"
      >
        <HiOutlineMenuAlt2 className="w-6 h-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-bold uppercase">
          {user?.name?.charAt(0) || "U"}
        </div>
        <span className="text-sm text-slate-300 hidden sm:block">
          {user?.name || "User"}
        </span>
      </div>
    </header>
  );
}
