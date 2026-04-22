import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Layout from "./components/Layout";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./pages/Dashboard";
import ProjectsList from "./pages/ProjectsList";
import TasksPage from "./pages/TasksPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>      
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginScreen />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/:projectId" element={<TasksPage />} />
            </Route>
          </Route>
  
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
