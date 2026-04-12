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
    { 
      to: "/dashboard", 
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      )
    },
    { 
      to: "/tasks", 
      label: "Tasks",
      icon: (
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    { 
      to: "/projects", 
      label: "Projects",
      icon: (
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
      )
    },
  ];

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
 
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
          className="container !px-4 md:px-6"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1300px"
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
            className="hidden md:flex"
            style={{
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
            {/* <div
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
            </div> */}

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
                className="btn-outline !text-[0.8rem] h-[32px] !py-[6px] !px-3"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="animate-fade-in flex-1 max-w-[1300px] w-[100%] !p-4 md:!p-6 !mx-auto pb-24 md:pb-6"
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center !p-2 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-t border-[var(--border)]"
        style={{
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)'
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full !pt-2 !pb-1 text-[11px] font-semibold transition-colors duration-200 ${
                isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
