import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineMap,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineTag,
  HiOutlineReceiptTax,
} from "react-icons/hi";
import useAuth from "../../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { to: "/rides", label: "Ride Management", icon: HiOutlineMap },
  { to: "/invoices", label: "Invoices", icon: HiOutlineDocumentText },
  { to: "/vehicles", label: "Vehicle Management", icon: HiOutlineTruck },
  { to: "/vehicle-expenses", label: "Vehicle Expenses", icon: HiOutlineReceiptTax },
  { to: "/parties", label: "Party Management", icon: HiOutlineUserGroup },
  { to: "/market", label: "Market Management", icon: HiOutlineUsers },
  { to: "/company-expenses", label: "Company Expenses", icon: HiOutlineCurrencyDollar },
  { to: "/expense-categories", label: "Expense Categories", icon: HiOutlineTag },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
          flex flex-col
        `}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-800">
          <h1 className="text-amber-500 font-bold text-lg tracking-wide leading-tight">
            ILAYS&SONS
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 tracking-wider uppercase">
            Transport
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}