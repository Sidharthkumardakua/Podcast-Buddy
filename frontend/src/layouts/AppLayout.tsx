import {
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/useAuth";
import "./AppLayout.css";
import MiniPlayer from "../components/MiniPlayer";

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search")?.trim() || "";
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSearch(urlSearch));

    return () => cancelAnimationFrame(frame);
  }, [urlSearch]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/app/news");
      return;
    }

    navigate(`/app/news?search=${encodeURIComponent(query)}`);
  };

  const navigation = [
    { label: "Home", path: "/app" },
    { label: "Explore", path: "/app/news" },
    { label: "Summaries", path: "/app/summaries" },
    { label: "Podcasts", path: "/app/podcast" },
    { label: "Library", path: "/app/history" },
    { label: "Settings", path: "/app/settings" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">♫</div>
          <span>Podcast Buddy AI</span>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">
                {item.label === "Home" && "⌂"}
                {item.label === "Explore" && "⌕"}
                {item.label === "Summaries" && "✦"}
                {item.label === "Podcasts" && "◉"}
                {item.label === "Library" && "▣"}
                {item.label === "Settings" && "⚙"}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>“Knowledge</p>
          <p>sounds better</p>
          <p>here.”</p>
          <span>Podcast Buddy AI</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <form className="search-box" onSubmit={handleSearch}>
            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search news, topics, or podcasts..."
              aria-label="Search news, topics, or podcasts"
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>

          <div className="topbar-right">
            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
            >
              ♧
            </button>

            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || "S"}
            </div>

            <div className="user-info">
              <span>Hello,</span>
              <strong>{user?.username || "User"}</strong>
            </div>

            <button className="logout-button" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
      <MiniPlayer />
    </div>
  );
}

export default AppLayout;
