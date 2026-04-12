import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/tasks", label: "Tasks" },
    { to: "/projects", label: "Projects" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation */}
      <header
        style={{
          height: 64,
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--heading-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--bg-secondary)",
                fontSize: "1rem",
              }}
            >
              ⚡
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em" }}>
              TaskFlow
            </span>
          </div>

          {/* Navigation Pills */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--nav-bg)",
              padding: 4,
              borderRadius: 999,
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Search Shortcut Placeholder */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                background: "var(--nav-bg)",
                borderRadius: 6,
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>Search</span>
              <span style={{ opacity: 0.5, border: "1px solid var(--border)", padding: "1px 4px", borderRadius: 3 }}>
                ⌘ K
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "4px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {user?.avatar || "?"}
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline"
                style={{ padding: "6px 12px", fontSize: "0.8rem", height: 32 }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          padding: "40px 24px",
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
