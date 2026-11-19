
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiFetch.js";
import { useSessionAuth } from "../auth/AuthContext.jsx";

import {
    ArrowLeft,
    Users as UsersIcon,
    RefreshCw,
    ShieldCheck,
    HardDrive,
    CalendarDays
} from "lucide-react";

import "./Pages.css";

const BASE_URL = "http://localhost:8080/api/auth/appUsers";

export default function Users() {
    const navigate = useNavigate();

    const {
        user,
        loading: sessionLoading,
        isAuthenticated
    } = useSessionAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchUsers = useCallback(async () => {
        if (!isAuthenticated) {
            setUsers([]);
            setError("Please log in to view users.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await apiFetch(
                `${BASE_URL}/GetAllUsers`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            if (response.status === 401) {
                setUsers([]);
                setError("Your session has expired. Please sign in again.");
                return;
            }

            if (response.status === 403) {
                setUsers([]);
                setError("You are not authorized to view users. Admin access is required.");
                return;
            }

            const result = await response.json();

            if (!response.ok || result?.code === 0) {
                throw new Error(
                    result?.message ||
                    `Unable to load users (HTTP ${response.status}).`
                );
            }

            const userList = Array.isArray(result)
                ? result
                : result?.data;

            if (!Array.isArray(userList)) {
                throw new Error("Backend response data is not a user list.");
            }

            setUsers(userList);

        } catch (err) {
            console.error("Fetch users error:", err);
            setError(err.message || "Unable to connect to backend.");
            setUsers([]);

        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!sessionLoading && isAuthenticated) {
            fetchUsers();
        }
    }, [sessionLoading, isAuthenticated, fetchUsers]);

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

                <div
                    className="side-link"
                    onClick={() => navigate("/google-drive")}
                >
                    <HardDrive size={19} />
                    Google Drive
                </div>

                <div
                    className="side-link"
                    onClick={() => navigate("/google-calendar")}
                >
                    <CalendarDays size={19} />
                    Google Calendar
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
                        disabled={loading || !isAuthenticated}
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

                    {sessionLoading && (
                        <p className="status-message">
                            Checking login session...
                        </p>
                    )}

                    {loading && (
                        <p className="status-message">
                            Loading users...
                        </p>
                    )}

                    {!sessionLoading && !isAuthenticated && (
                        <div className="error-message">
                            Please log in to view users.
                            <button onClick={handleLogin}>Sign In</button>
                        </div>
                    )}

                    {!sessionLoading && isAuthenticated && error && (
                        <div className="error-message">
                            {error}
                            <button onClick={fetchUsers}>Try again</button>
                        </div>
                    )}

                    {!sessionLoading && isAuthenticated && !loading && !error && (
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
                                    {users.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>
                                                <div className="user-name">
                                                    {item.name || "—"}
                                                </div>
                                            </td>
                                            <td>{item.email || "—"}</td>
                                            <td>
                                                <span className="provider-badge">
                                                    {item.authProvider || "—"}
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
