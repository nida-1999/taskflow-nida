import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import Drawer from "@mui/material/Drawer";

import { getAllTasks, getUsers, getProjects, updateTask } from "../services";
import type { Task, User, Project } from "../types";
import { useMobile } from "../hooks/useMobile";

// UI Components
import Button from "../components/ui/Button";
import MultiSelect from "../components/ui/MultiSelect";
import { Heading, Text } from "../components/ui/Typography";
import SingleSelect from "../components/ui/SingleSelect";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";

// Extracted Components
import TaskCard from "../components/TaskCard";
import KanbanColumn from "../components/KanbanColumn";
import TaskModal from "../components/TaskModal";
import CreateTaskForm from "../components/CreateTaskForm";

const FilterPill: React.FC<{ label: string; value: string; onRemove: () => void }> = ({ label, value, onRemove }) => (
  <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 !px-[10px] !py-1 rounded-lg border border-indigo-100 animate-in zoom-in-95 duration-200">
    <span className="text-[0.65rem] font-bold uppercase opacity-60 tracking-tight">{label}:</span>
    <span className="text-[0.75rem] font-bold">{value}</span>
    <button onClick={onRemove} className="ml-1 hover:text-indigo-900 transition-colors">✕</button>
  </div>
);

const TasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const isMobile = useMobile();


  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedTaskState, setSelectedTaskState] = useState<{ task: Task; mode: "view" | "edit" } | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [filters, setFilters] = useState({
    statuses: [] as string[],
    assignees: [] as string[],
    search: "",
  });
  const [sortBy, setSortBy] = useState<"createdAt" | "dueDate" | "priority" | "manual">("manual");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, u, p] = await Promise.all([getAllTasks(), getUsers(), getProjects()]);
        setTasks(t);
        setUsers(u);
        setProjects(p);
      } catch (error) {
        console.error("Failed to fetch tasks data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (projectId && t.projectId !== projectId) return false;
      const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(t.status);
      const matchAssignee = filters.assignees.length === 0 || filters.assignees.includes(t.assigneeId);
      const matchSearch = (t.title || "").toLowerCase().includes(filters.search.toLowerCase()) || 
                         (t.description || "").toLowerCase().includes(filters.search.toLowerCase());
      return matchStatus && matchAssignee && matchSearch;
    });

    if (sortBy === "manual") return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === "createdAt") return (b.createdAt || "").localeCompare(a.createdAt || "");
      if (sortBy === "dueDate") return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      if (sortBy === "priority") {
        const pMap = { high: 3, medium: 2, low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return 0;
    });
  }, [tasks, filters, sortBy, projectId]);

  const hasActiveFilters = filters.statuses.length > 0 || filters.assignees.length > 0 || filters.search !== "";
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const task = tasks.find((t) => String(t.id) === activeId);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTask = tasks.find((t) => String(t.id) === activeId);
    if (!activeTask) return;

    const overStatus = overId.startsWith("col-") 
      ? (overId.replace("col-", "") as any) 
      : tasks.find(t => String(t.id) === overId)?.status;

    if (!overStatus) return;

    if (activeTask.status !== overStatus) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => String(t.id) === activeId);
        const overIndex = prev.findIndex((t) => String(t.id) === overId);
        if (activeIndex === -1) return prev;

        const newTasks = [...prev];
        newTasks[activeIndex] = { ...newTasks[activeIndex], status: overStatus };

        if (overIndex >= 0) {
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(newTasks, activeIndex, newTasks.length - 1);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    
    const activeId = String(active.id);
    const overId = String(over.id);

    let nextTasks = [...tasks];

    if (activeId !== overId) {
      const activeIndex = nextTasks.findIndex((t) => String(t.id) === activeId);
      const overIndex = nextTasks.findIndex((t) => String(t.id) === overId);
      
      if (activeIndex !== -1 && overIndex !== -1 && nextTasks[activeIndex].status === nextTasks[overIndex].status) {
        nextTasks = arrayMove(nextTasks, activeIndex, overIndex);
        setTasks(nextTasks);
      }
    }

    const movedTask = nextTasks.find((t) => String(t.id) === activeId);
    if (movedTask) {
      // Fire and forget update
      updateTask(movedTask.id, movedTask).catch(e => console.error("Sync failed", e));
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center !p-24 gap-4 min-h-[400px]">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <Text className="text-slate-500 font-semibold italic">Loading workspace...</Text>
    </div>
  );

  if (projectId && !project) return (
    <div className="text-center !pt-20">
      <div className="text-5xl mb-4">😕</div>
      <Heading variant="h2" className="mb-4">Project Not Found</Heading>
      <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className={`flex ${isMobile ? "flex-col" : "row"} justify-between items-center gap-4`}>
        <div>
          {projectId && (
            <button onClick={() => navigate("/projects")} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors mb-2 text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              Back to Projects
            </button>
          )}
          <Heading variant="h1">{project ? project.name : "Tasks"}</Heading>
          <Text variant="small" className="mt-1 text-slate-500 max-w-xl">{project ? project.description : "Manage your team's activities and deadlines."}</Text>
        </div>
        <div className={`flex ${isMobile ? "flex-col w-full" : "row"} gap-3 items-center`}>
          <Button className={isMobile ? "w-full" : "h-10 !px-6"} onClick={() => setIsCreatingTask(true)}>
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Create Task
          </Button>
          {!isMobile && (
            <div className="flex bg-slate-100 !p-1 rounded-xl">
              <button className={`!px-4 !py-[6px] rounded-lg text-sm font-bold !cursor-pointer transition-all ${viewMode === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`} onClick={() => setViewMode("kanban")}>Kanban</button>
              <button className={`!px-4 !py-[6px] rounded-lg text-sm font-bold !cursor-pointer transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`} onClick={() => setViewMode("list")}>List</button>
            </div>
          )}
        </div>
      </div>

      <div className={`bg-slate-50 border border-slate-100 rounded-2xl !p-4 flex ${isMobile ? "flex-col" : "items-end flex-wrap"} gap-4`}>
        <div className={`flex flex-col gap-1 ${isMobile ? "w-full" : "flex-1 min-w-[220px]"}`}>
          <Text variant="tiny">Search</Text>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">🔍</span>
            <input className="w-full h-9 !pl-8 !pr-3 rounded-lg border border-slate-200 text-[0.85rem] outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all" placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
        </div>
        {!isMobile && <div className="w-px h-10 bg-slate-200 self-end mb-0.5" />}
        <MultiSelect label="Status" placeholder="Filter status" options={[{ value: "todo", label: "To Do" }, { value: "in-progress", label: "In Progress" }, { value: "review", label: "Review" }, { value: "done", label: "Done" }]} selected={filters.statuses} onChange={(vals) => setFilters(f => ({ ...f, statuses: vals }))} />
        <MultiSelect label="Assignee" placeholder="Filter assignee" options={users.map(u => ({ value: u.id, label: u.name }))} selected={filters.assignees} onChange={(vals) => setFilters(f => ({ ...f, assignees: vals }))} />
        {!isMobile && <div className="w-px h-10 bg-slate-200 self-end mb-0.5" />}
        <SingleSelect
          label="Sort by"
          value={sortBy}
          onChange={(val) => setSortBy(val as any)}
          options={[
            { value: "manual", label: "Manual" },
            { value: "createdAt", label: "Newest first" },
            { value: "dueDate", label: "Due date" },
            { value: "priority", label: "Priority" },
          ]}
        />
        <Button variant="ghost" className={`h-9 !px-4 text-[0.82rem] font-bold self-end ${hasActiveFilters ? "text-red-500" : "text-slate-300 pointer-events-none"}`} onClick={() => setFilters({ statuses: [], assignees: [], search: "" })}>✕ Clear Filters</Button>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
          <Text variant="tiny" className="font-bold text-slate-400 uppercase">Filtered By:</Text>
          {filters.search && <FilterPill label="Search" value={filters.search} onRemove={() => setFilters(f => ({ ...f, search: "" }))} />}
          {filters.statuses.map(s => <FilterPill key={s} label="Status" value={s.replace('-', ' ')} onRemove={() => setFilters(f => ({ ...f, statuses: f.statuses.filter(x => x !== s) }))} />)}
          {filters.assignees.map(a => <FilterPill key={a} label="Assignee" value={users.find(u => u.id === a)?.name || ""} onRemove={() => setFilters(f => ({ ...f, assignees: f.assignees.filter(x => x !== a) }))} />)}
        </div>
      )}

      {viewMode === "kanban" ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto !pb-6 custom-scrollbar">
            {["todo", "in-progress", "review", "done"].map(status => (
              <KanbanColumn key={status} id={status as any} title={status.replace('-', ' ')} tasks={filteredTasks.filter(t => t.status === (status as any))} users={users} projects={projects} onTaskClick={t => setSelectedTaskState({ task: t, mode: "view" })} onTaskEdit={t => setSelectedTaskState({ task: t, mode: "edit" })} />
            ))}
          </div>
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
            {activeTask && <div className="rotate-2 pointer-events-none drop-shadow-2xl"><TaskCard task={activeTask} user={users.find(u => u.id === activeTask.assigneeId)} project={projects.find(p => p.id === activeTask.projectId)} isOverlay /></div>}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Task", "Project", "Assignee", "Status", "Priority", "Due Date", "Actions"].map(h => <th key={h} className="text-left !px-6 !py-4 text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedTaskState({ task, mode: "view" })}>
                  <td className="!px-6 !py-4"><Text className="font-bold text-slate-900">{task.title}</Text></td>
                  <td className="!px-6 !py-4"><Badge variant="neutral">{projects.find(p => p.id === task.projectId)?.name || "Global"}</Badge></td>
                  <td className="!px-6 !py-4"><div className="flex items-center gap-2"><Avatar name={users.find(u => u.id === task.assigneeId)?.name || "?"} size="sm" /><Text variant="tiny" className="font-semibold">{users.find(u => u.id === task.assigneeId)?.name}</Text></div></td>
                  <td className="!px-6 !py-4"><Badge variant="neutral" className="capitalize">{task.status.replace("-", " ")}</Badge></td>
                  <td className="!px-6 !py-4"><Badge variant={task.priority as any}>{task.priority}</Badge></td>
                  <td className="!px-6 !py-4"><Text variant="tiny" className="font-medium text-slate-500">{task.dueDate || "-"}</Text></td>
                  <td className="!px-6 py-4 text-center">
                    <button className="!p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100" onClick={e => { e.stopPropagation(); setSelectedTaskState({ task, mode: "edit" }); }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="!px-6 !py-20 text-center"><Text className="font-bold text-slate-400">No tasks found matching your filters.</Text><button onClick={() => setFilters({ statuses: [], assignees: [], search: "" })} className="text-indigo-600 font-bold hover:underline">Reset all filters</button></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedTaskState && (
        <TaskModal task={selectedTaskState.task} initialMode={selectedTaskState.mode} user={users.find(u => u.id === selectedTaskState.task.assigneeId)} users={users} project={projects.find(p => p.id === selectedTaskState.task.projectId)} onClose={() => setSelectedTaskState(null)} onUpdate={updated => setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))} />
      )}

      {isCreatingTask && (
        isMobile ? (
          <Drawer anchor="bottom" open={true} onClose={() => setIsCreatingTask(false)} slotProps={{ paper: { className: "rounded-t-3xl overflow-hidden" } }}>
            <CreateTaskForm users={users} projects={projects} initialProjectId={projectId} onClose={() => setIsCreatingTask(false)} onCreate={newTask => setTasks(prev => [...prev, newTask])} isMobile={true} />
          </Drawer>
        ) : (
          <Modal isOpen={true} onClose={() => setIsCreatingTask(false)}>
            <CreateTaskForm users={users} projects={projects} initialProjectId={projectId} onClose={() => setIsCreatingTask(false)} onCreate={newTask => setTasks(prev => [...prev, newTask])} />
          </Modal>
        )
      )}
    </div>
  );
};

export default TasksPage;
