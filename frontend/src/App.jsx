import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Builds from "./pages/Builds";
import Issues from "./pages/Issues";
import CodeQuality from "./pages/CodeQuality";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="builds" element={<Builds />} />
        <Route path="issues" element={<Issues />} />
        <Route path="code-quality" element={<CodeQuality />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;