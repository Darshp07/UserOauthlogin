
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext.jsx";
import GoogleDrive from "./pages/GoogleDrive.jsx";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/google-drive" element={<GoogleDrive />} />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);
