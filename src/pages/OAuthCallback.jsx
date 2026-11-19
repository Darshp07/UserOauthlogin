
import { useEffect } from "react";
import { useAuthContext } from "react-oauth2-code-pkce";
import { useNavigate } from "react-router-dom";
import { useAppAuth } from "../auth/useAppAuth.js";
import { clearAuthTokens } from "../auth/authTokens.js";

export default function OAuthCallback() {
  const { token } = useAppAuth();
  const {
    token: oauthToken,
    loginInProgress,
    error: oauthError,
    logOut,
  } = useAuthContext();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const hasAuthorizationCode = params.has("code");
  const hasCodeVerifier = Boolean(
    localStorage.getItem("ROCP_PKCE_code_verifier")
  );
  const error = hasAuthorizationCode
    ? ""
    : "No sign-in code was returned. Start again from the login page.";

  const returnToLogin = () => {
    clearAuthTokens();
    logOut();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (token || oauthToken) {
      navigate("/dashboard", { replace: true });
      return;
    }

  }, [token, oauthToken, navigate]);

  if (error || oauthError) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login failed</h2>
        <p role="alert">
          {error || String(oauthError)}
        </p>
        <button onClick={returnToLogin}>Back to Login</button>
      </div>
    );
  }

  if (!token && !oauthToken && !loginInProgress) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Authentication did not complete</h2>
        <p>
          {hasAuthorizationCode && !hasCodeVerifier
            ? "The authorization code was returned without its PKCE verifier. Start a new login from the app’s home page."
            : "No access token was received. Start a new login from the app’s home page."}
        </p>
        <button onClick={returnToLogin}>Back to Login</button>
      </div>
    );
  }

  return (
    <main className="oauth-loading" role="status" aria-live="polite">
      <span className="oauth-spinner" aria-hidden="true" />
      <h2>{token || oauthToken ? "Finishing sign in..." : "Signing you in..."}</h2>
      <p>Saving your session before opening the dashboard.</p>
    </main>
  );
}
