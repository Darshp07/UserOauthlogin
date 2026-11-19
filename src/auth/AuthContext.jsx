
import { useCallback, useEffect, useState, useContext } from "react";
import AuthContext from "./authContextValue.js";

const BACKEND_URL = "http://localhost:8080";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState("");

    const checkSession = useCallback(async () => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/auth/appUsers/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                setUser(null);
                setAuthError("Not logged in");
                return null;
            }

            const result = await response.json();
            const currentUser = result.data;

            setUser(currentUser || null);
            setAuthError("");

            return currentUser || null;
        } catch (error) {
            console.error(error);
            setUser(null);
            setAuthError("Unable to connect to backend.");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const logout = async () => {
        try {
            await fetch(`${BACKEND_URL}/logout`, {
                method: "POST",
                credentials: "include"
            });
        } finally {
            setUser(null);
            window.location.href = "/";
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: Boolean(user),
            authError,
            checkSession,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useSessionAuth() {
    return useContext(AuthContext);
}
