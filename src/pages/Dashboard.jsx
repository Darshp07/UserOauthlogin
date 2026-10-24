
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "react-oauth2-code-pkce";
import { clearAuthTokens } from "../auth/authTokens.js";
import { useAppAuth } from "../auth/useAppAuth.js";
import {
  Users,
  ShieldCheck,
  ArrowRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import "./Pages.css";

export default function Dashboard() {
  const { token, refreshToken, refreshError } = useAppAuth();
  const { logOut } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthTokens();
    logOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="brand">DarshakApp<span>.</span></h2>

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

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>


      <main className="main-content">
        {token && !refreshToken && (
          <div className="error-message" role="status">
            Your backend did not provide a refresh token. Automatic access-token
            renewal is unavailable; sign in again after this token expires.
          </div>
        )}

        {refreshError && (
          <div className="error-message" role="alert">
            {refreshError}
          </div>
        )}

        <div className="info-card">
          <ShieldCheck size={22} />
          <div>
            <h3>OAuth2 Authentication Status</h3>
            <p>
              {token ? "Authenticated" : "Not logged in"}
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

          <div className="profile-badge">D</div>
        </div>

        <div className="welcome-card">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2>Welcome to DarshakApp 👋</h2>
            <p>
              Manage users securely using OAuth 2.0 authentication.
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/users")}
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
            <p>Total Users</p>
            <h2>—</h2>
            <span>Click Load All Users to fetch</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <ShieldCheck size={23} />
            </div>
            <p>Authentication</p>
            <h2>OAuth 2.0</h2>
            <span>Access-token security</span>
          </div>
        </div>

        <div className="info-card">
          <ShieldCheck size={22} />
          <div>
            <h3>Secure API access</h3>
            <p>
              Your saved JWT token will be sent to the backend
              when requesting protected user data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
