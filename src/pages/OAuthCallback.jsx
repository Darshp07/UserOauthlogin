
import { useEffect, useState } from "react";
import { useAuthContext } from "react-oauth2-code-pkce";
import { useNavigate } from "react-router-dom";
import { saveAuthTokens } from "../auth/authTokens.js";
import { useAppAuth } from "../auth/useAppAuth.js";

export default function OAuthCallback() {
  const {
    token,
    loginInProgress,
    error,
  } = useAuthContext();

  const { token: savedToken } = useAppAuth();
  const navigate = useNavigate();
  const [persistedToken, setPersistedToken] = useState("");
  const [saveError, setSaveError] = useState("");
  const hasAuthorizationCode = new URLSearchParams(window.location.search).has(
    "code"
  );
  const hasCodeVerifier = Boolean(
    localStorage.getItem("ROCP_PKCE_code_verifier")
  );

  useEffect(() => {
    if (!token || persistedToken === token) {
      return;
    }

    try {
      saveAuthTokens({ accessToken: token, refreshToken: null });
      setPersistedToken(token);
      setSaveError("");
    } catch {
      setSaveError("Your sign-in token could not be saved. Please try again.");
    }
  }, [token, persistedToken]);

  useEffect(() => {
    if (token && persistedToken === token && savedToken === token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, persistedToken, savedToken, navigate]);

  if (error || saveError) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login failed</h2>
        <pre>{saveError || String(error)}</pre>
        <button onClick={() => navigate("/", { replace: true })}>
          Back to Login
        </button>
      </div>
    );
  }

  if (!token && !loginInProgress) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Authentication did not complete</h2>
        <p>
          {hasAuthorizationCode && !hasCodeVerifier
            ? "The authorization code was returned without its PKCE verifier. Start a new login from the app’s home page."
            : "No access token was received. Start a new login from the app’s home page."}
        </p>
        <button onClick={() => navigate("/", { replace: true })}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <main className="oauth-loading" role="status" aria-live="polite">
      <span className="oauth-spinner" aria-hidden="true" />
      <h2>{token ? "Finishing sign in..." : "Signing you in..."}</h2>
      <p>Saving your session before opening the dashboard.</p>
    </main>
  );
}
