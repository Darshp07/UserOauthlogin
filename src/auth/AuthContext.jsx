import { useEffect, useState } from "react";
import AuthContext from "./authContextValue.js";
import { getAuthTokens, subscribeToAuthState } from "./authTokens.js";
import {
  getAccessTokenExpiry,
  refreshAccessToken,
} from "./tokenRefresh.js";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getAuthTokens);
  const [refreshError, setRefreshError] = useState("");

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthTokens());
    const unsubscribe = subscribeToAuthState(syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!auth.token || !auth.refreshToken) {
      return undefined;
    }

    if (getAccessTokenExpiry(auth.token) === null) {
      return undefined;
    }

    let timeoutId;
    const scheduleRefresh = () => {
      const expiresAt = getAccessTokenExpiry(auth.token);
      if (expiresAt === null) {
        return;
      }

      const refreshIn = expiresAt - Date.now() - 60_000;
      if (refreshIn > 0) {
        timeoutId = window.setTimeout(
          scheduleRefresh,
          Math.min(refreshIn, 2_147_000_000)
        );
        return;
      }

      refreshAccessToken()
        .then(() => setRefreshError(""))
        .catch((error) => {
          setRefreshError(error.message || "Unable to refresh your session.");
        });
    };
    scheduleRefresh();

    return () => window.clearTimeout(timeoutId);
  }, [auth.token, auth.refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        refreshToken: auth.refreshToken,
        isAuthenticated: Boolean(auth.token),
        refreshError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
