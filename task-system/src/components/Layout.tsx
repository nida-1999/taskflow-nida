import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
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
          background: "#ffffff",
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
                background: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
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
              background: "#F1F5F9",
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
                background: "#f1f5f9",
                borderRadius: 6,
                fontSize: "0.75rem",
                color: "#64748b",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span>Search</span>
              <span style={{ opacity: 0.5, border: "1px solid #cbd5e1", padding: "1px 4px", borderRadius: 3 }}>
                ⌘ K
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
