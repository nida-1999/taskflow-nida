import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjects, createProject, deleteProject, deleteTasksByProject, getAllTasks, updateProject } from "../services";
import Modal from "../components/ui/Modal";
import type { Project, Task } from "../types";
import { useMobile } from "../hooks/useMobile";
import ProjectsSkeleton from "../components/ProjectsSkeleton";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const isMobile = useMobile()

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
      if (projectToEdit) {
        await updateProject(projectToEdit.id, {
          name: newProject.name.trim(),
          description: newProject.description.trim(),
        });
      } else {
        await createProject({
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          createdBy: user?.id || "",
          createdAt: new Date().toISOString().split("T")[0],
        });
      }
      setNewProject({ name: "", description: "" });
      setShowModal(false);
      setProjectToEdit(null);
      await load();
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setNewProject({ name: project.name, description: project.description || "" });
    setShowModal(true);
  };

  const handleDelete = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setDeletingId(projectToDelete.id);
    setShowDeleteModal(false);
    try {
      await deleteTasksByProject(projectToDelete.id);
      await deleteProject(projectToDelete.id);
      await load();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeletingId(null);
      setProjectToDelete(null);
    }
  };

  if (loading) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between !mb-10">
        <div>
          <h1 className ="text-[1.75rem] font-bold !mb-1" >Projects</h1>
          <p className="text-[0.9rem] text-secondary">Manage your initiatives and team goals.</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"   
          onClick={() => setShowModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isMobile ? "New" :"New Project"}
        </button>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="card !p-16 text-center">
          <div className="text-[2.5rem] !mb-4">📂</div>
          <h3 className="text-[1.1rem] font-bold !mb-2">No projects yet</h3>
          <p className="text-[0.9rem] text-secondary !mb-6">
            Create your first project to start organizing your team's workflow.
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Create Project
          </button>
        </div>
      ) : (
        <div
        className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === "done").length;
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
            const isDeleting = deletingId === project.id;

            return (
              <div
                key={project.id}
                className={`card animate-fade-in !p-6 cursor-pointer relative flex flex-col ${isDeleting ? "opacity-50" : ""}`}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => handleEdit(project, e)}
                    disabled={isDeleting}
                    aria-label={`Edit project ${project.name}`}
                    className="w-[28px] h-[28px] rounded-lg bg-transparent border border-border text-text-secondary cursor-pointer flex items-center justify-center text-xs transition-all duration-200 hover:border-primary hover:text-primary"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => handleDelete(project, e)}
                    disabled={isDeleting}
                    aria-label={`Delete project ${project.name}`}
                    className="w-[28px] h-[28px] rounded-lg bg-transparent border border-border text-text-secondary cursor-pointer flex items-center justify-center text-xs transition-all duration-200 hover:border-red-500 hover:text-red-500"
                  >
                    🗑
                  </button>
                </div>

                <div className="!mb-4">
                  <h3 className="text-[1.05rem] font-bold !mb-2" style={{ paddingRight: 32 }}>
                    {project.name}
                  </h3>
                  <p
                  className="text-secondary text-[0.85rem] leading-1.5"
                  >
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    <span>{projectTasks.length} tasks</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar-track h-4">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-secondary text-[0.7rem] !mt-4">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setProjectToEdit(null);
          setNewProject({ name: "", description: "" });
        }}>
          <div className="card" style={{ width: "90%", maxWidth: 450, padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 24 }}>
              {projectToEdit ? "Edit Project" : "New Project"}
            </h2>

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
                <button type="button" className="btn-outline" onClick={() => {
                  setShowModal(false);
                  setProjectToEdit(null);
                  setNewProject({ name: "", description: "" });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating || !newProject.name.trim()}>
                  {creating ? (projectToEdit ? "Saving..." : "Creating...") : (projectToEdit ? "Save Changes" : "Create Project")}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        maxWidth="max-w-md"
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn-primary flex-1" style={{ backgroundColor: "var(--error)" }} onClick={confirmDelete}>
              Yes, Delete
            </button>
          </>
        }
      >
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
            Are you sure you want to delete this project?
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
            This action will permanently delete <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{projectToDelete?.name}</span> and all its associated tasks. This cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsList;
