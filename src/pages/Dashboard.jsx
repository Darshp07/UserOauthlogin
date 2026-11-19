
import { useNavigate } from "react-router-dom";
import { useSessionAuth } from "../auth/AuthContext.jsx";
import {
    Users,
    ShieldCheck,
    ArrowRight,
    LogOut,
    LayoutDashboard
} from "lucide-react";

import "./Pages.css";

export default function Dashboard() {
    const navigate = useNavigate();

    const {
        user,
        loading,
        isAuthenticated,
        authError,
        logout
    } = useSessionAuth();

    if (loading) {
        return <div className="status-message">Checking login session...</div>;
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="brand">
                    DarshakApp<span>.</span>
                </h2>

                <div className="side-link active">
                    <LayoutDashboard size={19} />
                    Dashboard
                </div>

                <div
                    className="side-link"
                    onClick={() => navigate("/users")}
                >
                    <Users size={19} />
                    All Users
                </div>

                <button className="logout-btn" onClick={logout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            <main className="main-content">
                {!isAuthenticated && (
                    <div className="error-message" role="alert">
                        {authError || "Please log in."}
                        <button onClick={() => navigate("/")}>
                            Sign In
                        </button>
                    </div>
                )}

                <div className="info-card">
                    <ShieldCheck size={22} />

                    <div>
                        <h3>Authentication Status</h3>
                        <p>
                            {isAuthenticated
                                ? "Authenticated"
                                : "Not logged in"}
                        </p>
                    </div>
                </div>

                <div className="topbar">
                    <div>
                        <p className="eyebrow">OVERVIEW</p>
                        <h1>Dashboard</h1>
                        <p className="muted">
                            Welcome back! Manage your application here.
                        </p>
                    </div>

                    <div className="profile-badge">
                        {(user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="welcome-card">
                    <div>
                        <p className="eyebrow">YOUR WORKSPACE</p>

                        <h2>
                            Welcome {user?.name || "User"} 👋
                        </h2>

                        <p>
                            Manage users securely using Google OAuth2
                            session authentication.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={() => navigate("/users")}
                            disabled={!isAuthenticated}
                        >
                            <Users size={18} />
                            Load All Users
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="hero-icon">
                        <ShieldCheck size={76} />
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <Users size={23} />
                        </div>

                        <p>Logged-in User</p>
                        <h2>{user?.name || "—"}</h2>
                        <span>{user?.email || "Not available"}</span>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <ShieldCheck size={23} />
                        </div>

                        <p>Authentication</p>
                        <h2>Google OIDC</h2>
                        <span>Spring Boot Session</span>
                    </div>
                </div>

                <div className="info-card">
                    <ShieldCheck size={22} />

                    <div>
                        <h3>Secure API access</h3>
                        <p>
                            Your JSESSIONID session cookie is sent
                            automatically with protected API requests.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
