import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjects, createProject, deleteProject, deleteTasksByProject, getAllTasks } from "../services";
import type { Project, Task } from "../types";

const ProjectsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [p, t] = await Promise.all([getProjects(), getAllTasks()]);
      setProjects(p);
      setTasks(t);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setCreating(true);
    try {
      await createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        createdBy: user?.id || "",
        createdAt: new Date().toISOString().split("T")[0],
      });
      setNewProject({ name: "", description: "" });
      setShowModal(false);
      await load();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this project and all its tasks?")) return;

    setDeletingId(id);
    try {
      await deleteTasksByProject(id);
      await deleteProject(id);
      await load();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div className="spinner" style={{ borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}>Projects</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Manage your initiatives and team goals.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📂</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>No projects yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: "0.9rem" }}>
            Create your first project to start organizing your team's workflow.
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Create Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 24,
          }}
        >
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === "done").length;
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
            const isDeleting = deletingId === project.id;

            return (
              <div
                key={project.id}
                className="card animate-fade-in"
                style={{
                  padding: 24,
                  cursor: "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column"
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {/* Delete button (only visible on hover via CSS or just subtle) */}
                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  disabled={isDeleting}
                  aria-label={`Delete project ${project.name}`}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--error)";
                    e.currentTarget.style.color = "var(--error)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  🗑
                </button>

                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8, paddingRight: 32 }}>
                    {project.name}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    <span>{projectTasks.length} tasks</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 4 }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ marginTop: 16, fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: "90%", maxWidth: 450, padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 24 }}>New Project</h2>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Project Name
                </label>
                <input
                  type="text"
                  className="input-minimal"
                  placeholder="e.g. Q2 Marketing Campaign"
                  value={newProject.name}
                  onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  className="input-minimal"
                  style={{ minHeight: 100, resize: "vertical" }}
                  placeholder="What's this project's goal?"
                  value={newProject.description}
                  onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating || !newProject.name.trim()}>
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProjectsList;
