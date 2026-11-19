import { clearAuthTokens, getAuthTokens } from "../auth/authTokens.js";

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include"
});
return response;

};
