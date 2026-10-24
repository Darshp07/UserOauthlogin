import { clearAuthTokens, getAuthTokens, saveAuthTokens } from "./authTokens.js";

const REFRESH_URL = "http://localhost:8080/api/auth/appUsers/refresh";
let refreshPromise = null;

export function getAccessTokenExpiry(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const claims = JSON.parse(atob(normalizedPayload));

    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = getAuthTokens();
      if (!refreshToken) {
        throw new Error("Refresh token is missing. Please log in again.");
      }

      const response = await fetch(REFRESH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const responseText = await response.text();
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          `Token refresh returned an invalid response (HTTP ${response.status}).`
        );
      }

      const newAccessToken =
        result?.data?.access_token ?? result?.data?.accessToken;
      if (!response.ok || result?.code === 0 || !newAccessToken) {
        throw new Error(
          result?.message || `Token refresh failed (HTTP ${response.status}).`
        );
      }

      const nextRefreshToken =
        result.data?.refresh_token ?? result.data?.refreshToken;
      saveAuthTokens({
        accessToken: newAccessToken,
        ...(nextRefreshToken ? { refreshToken: nextRefreshToken } : {}),
      });
      return newAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    return await refreshPromise;
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
}
