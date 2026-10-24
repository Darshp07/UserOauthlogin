import { clearAuthTokens, getAuthTokens } from "../auth/authTokens.js";
import { refreshAccessToken } from "../auth/tokenRefresh.js";

export async function apiFetch(url, options = {}) {
    const sendRequest = (accessToken) => {
        const headers = new Headers(options.headers || {});

        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };

    const { token: currentToken } = getAuthTokens();
    let response = await sendRequest(currentToken);

    if (response.status !== 401) {
        return response;
    }

    const { token: latestToken } = getAuthTokens();
    if (latestToken && latestToken !== currentToken) {
        return sendRequest(latestToken);
    }

    const newAccessToken = await refreshAccessToken();

    response = await sendRequest(newAccessToken);

    if (response.status === 401) {
        clearAuthTokens();
    }

    return response;
}
