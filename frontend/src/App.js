import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import "./App.css";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import StudentTable from "./pages/StudentTable";
import StudentProfile from "./pages/StudentProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  const { theme } = useTheme();

  return (
    <div className={`app ${theme}`}>
      <Navbar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Navigate to="/students" />} />
          <Route path="/students" element={<StudentTable />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
