const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshtoken";
const AUTH_STATE_EVENT = "app-auth-state-change";

export function getAuthTokens() {
  return {
    token: localStorage.getItem(TOKEN_KEY) || "",
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || "",
  };
}

export function subscribeToAuthState(callback) {
  window.addEventListener(AUTH_STATE_EVENT, callback);
  return () => window.removeEventListener(AUTH_STATE_EVENT, callback);
}

export function saveAuthTokens({ accessToken, refreshToken } = {}) {
  if (!accessToken) {
    throw new Error("An access token is required to authenticate.");
  }

  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else if (refreshToken === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

export function saveAuthResponseTokens(data) {
  // Accept only the app API's explicit access-token fields. A generic `token`
  // field can contain a Google ID token, which the API resource server cannot
  // validate with its own JWT signing key.
  const accessToken = data?.access_token ?? data?.accessToken;
  const refreshToken = data?.refresh_token ?? data?.refreshToken;

  if (!accessToken) {
    throw new Error("The login response did not include an access token.");
  }

  saveAuthTokens({
    accessToken,
    refreshToken: refreshToken || null,
  });

  return { hasRefreshToken: Boolean(refreshToken) };
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}
