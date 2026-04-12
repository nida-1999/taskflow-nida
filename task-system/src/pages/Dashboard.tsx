import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjects, getAllTasks } from "../services";
import type { Project, Task } from "../types";
import { useMobile } from "../hooks/useMobile";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMobile()

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t] = await Promise.all([getProjects(), getAllTasks()]);
        setProjects(p);
        setTasks(t);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div className="spinner" style={{ borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  // Logic for Bento Cards
  const focusProject = projects[0] || null;
  const focusTasks = focusProject 
    ? tasks.filter(t => t.projectId === focusProject.id).slice(0, 3)
    : [];
  
  const upcomingTasks = tasks
    .filter(t => t.dueDate && t.status !== "done")
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
    .slice(0, 4);

  const recentProjects = projects.slice(0, 3);

  // Focus Project Progress
  const focusProjectTasks = focusProject ? tasks.filter(t => t.projectId === focusProject.id) : [];
  const focusDoneCount = focusProjectTasks.filter(t => t.status === "done").length;
  const focusProgress = focusProjectTasks.length > 0 
    ? Math.round((focusDoneCount / focusProjectTasks.length) * 100) 
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}>
          Good morning, {user?.name}.
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          You have {tasks.filter(t => t.status !== "done").length} total open tasks today.
        </p>
      </header>

      {/* Bento Grid */}
      <div className={isMobile ? "" : "bento-grid"}>
        {/* Today's Focus */}
        <div className="card bento-focus" style={{ padding: 32, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 24 }}>
            <span className="column-label" style={{ fontSize: "0.7rem" }}>Today's Focus</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 8 }}>
              {focusProject ? focusProject.name : "No active project"}
            </h2>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {focusTasks.length > 0 ? (
              focusTasks.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input 
                    type="checkbox" 
                    checked={task.status === "done"} 
                    readOnly
                    style={{ 
                      width: 18, 
                      height: 18, 
                      accentColor: "var(--accent)",
                      cursor: "pointer" 
                    }} 
                  />
                  <span style={{ fontSize: "0.95rem", color: task.status === "done" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: task.status === "done" ? "line-through" : "none" }}>
                    {task.title}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No tasks assigned for this project yet.</p>
            )}
          </div>

          {focusProject && (
            <div style={{ marginTop: "auto", paddingTop: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Progress</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{focusProgress}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${focusProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className={`card !p-6 ${isMobile ? "!mt-6" : ""} `}>
          <span className="column-label text-[0.7rem] !mb-4 block">Upcoming</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div className="dot dot-amber" />
                    <span style={{ fontSize: "0.9rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {task.title}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)", background: "var(--nav-bg)", padding: "2px 6px", borderRadius: 4 }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No upcoming deadlines.</p>
            )}
          </div>
          <button 
            className="btn-outline" 
            style={{ width: "100%", marginTop: 24, padding: "8px" }}
            onClick={() => navigate("/tasks")}
          >
            View all tasks
          </button>
        </div>

        
        <div className={`card !p-6 flex flex-col justify-center items-center text-center ${isMobile ? "!my-6" : ""}`}>
          <div className="text-[2rem] !mb-2">📈</div>
          <div className="text-[1.25rem] font-bold">{Math.round((tasks.filter(t => t.status === "done").length / (tasks.length || 1)) * 100)}%</div>
          <div className="text-[0.75rem] text-secondary font-medium">Overall Completion</div>
        </div>

        {/* Recent Projects (Wide Row at bottom) */}
        <div className="card !p-6" style={{ gridColumn: "span 3"}}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span className="column-label" style={{ fontSize: "0.7rem" }}>Recent Projects</span>
            <button className="btn-outline" onClick={() => navigate("/projects")} style={{ padding: "4px 12px", fontSize: "0.75rem" }}>
              View All
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {recentProjects.map(project => {
               const pTasks = tasks.filter(t => t.projectId === project.id);
               const pDone = pTasks.filter(t => t.status === "done").length;
               const pProgress = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
               return (
                <div 
                  key={project.id} 
                  style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, cursor: "pointer" }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 12 }}>{project.name}</h3>
                  <div className="progress-bar-track" style={{ height: 4 }}>
                    <div className="progress-bar-fill" style={{ width: `${pProgress}%` }} />
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
