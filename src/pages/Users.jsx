
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthTokens } from "../auth/authTokens.js";
import { getAccessTokenExpiry } from "../auth/tokenRefresh.js";
import { useAppAuth } from "../auth/useAppAuth.js";
import { apiFetch } from "../api/apiFetch";
import {
  ArrowLeft,
  Users as UsersIcon,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import "./Pages.css";

const BASE_URL = "http://localhost:8080/api/auth/appUsers";

function getSessionErrorMessage(token) {
  const expiresAt = getAccessTokenExpiry(token);
  if (expiresAt !== null && expiresAt <= Date.now()) {
    return "Your access token expired and could not be refreshed. Please sign in again.";
  }

  return "The API rejected your access token. Please sign in again. If this continues, the backend token signing key and validation settings must match.";
}

export default function Users() {
  const navigate = useNavigate();
  const { token } = useAppAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("Access token is not available. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await apiFetch(`${BASE_URL}/GetAllUsers`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        setUsers([]);
        setError(getSessionErrorMessage(token));
        return;
      }

      if (response.status === 403) {
        setError("You are not authorized to view users.");
        return;
      }

      const responseText = await response.text();
      let result;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        const detail = responseText.trim();
        throw new Error(
          response.ok
            ? "The users endpoint returned a non-JSON response."
            : `Users API failed (HTTP ${response.status})${detail ? `: ${detail}` : ""}`
        );
      }

      if (!response.ok || result?.code === 0) {
        throw new Error(
          result?.message || `Unable to load users (HTTP ${response.status}).`
        );
      }

      const userList = Array.isArray(result) ? result : result?.data;

      if (!Array.isArray(userList)) {
        throw new Error("Backend response data is not a user list.");
      }

      setUsers(userList);
    } catch (err) {
      if (!getAuthTokens().token) {
        setUsers([]);
        setError(getSessionErrorMessage(token));
      } else {
        setError(err.message || "Unable to connect to backend.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, fetchUsers]);

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="brand">
          DarshakApp<span>.</span>
        </h2>

        <div
          className="side-link"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={19} />
          Dashboard
        </div>

        <div className="side-link active">
          <UsersIcon size={19} />
          All Users
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div>
            <p className="eyebrow">USER MANAGEMENT</p>
            <h1>All Users</h1>
            <p className="muted">
              View user data fetched securely from your backend.
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchUsers}
            disabled={loading || !token}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="users-summary">
          <div className="stat-icon purple">
            <UsersIcon size={24} />
          </div>

          <div>
            <p className="muted">Users loaded</p>
            <h2>{users.length}</h2>
          </div>

          <div className="secure-label">
            <ShieldCheck size={17} />
            OAuth2 Protected
          </div>
        </div>

        <div className="table-card">
          <div className="table-heading">
            <h3>Registered Users</h3>
            <span>{users.length} records</span>
          </div>

          {loading && (
            <p className="status-message">Loading users...</p>
          )}

          {(!token || error) && (
            <div className="error-message">
              {error || "Please log in to view users."}
              {token ? (
                <button onClick={fetchUsers}>Try again</button>
              ) : (
                <button onClick={handleLogin}>Sign In</button>
              )}
            </div>
          )}

          {!loading && !error && token && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Provider</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className="user-name">
                          {/* <div className="avatar">
                            {(user.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div> */}
                          {user.name || "—"}
                        </div>
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <span className="provider-badge">
                          {user.authProvider || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
