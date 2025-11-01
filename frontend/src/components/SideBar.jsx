import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Loans", path: "/loans" },
  ];

  return (
    <div className="w-full md:w-60 bg-gray-800 text-white h-auto md:h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-3 py-2 rounded hover:bg-gray-700 ${
              pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
