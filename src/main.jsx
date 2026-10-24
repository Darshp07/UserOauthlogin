
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider as OAuthProvider } from "react-oauth2-code-pkce";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext.jsx";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";

import "./index.css";

const GOOGLE_CLIENT_ID =
  "207867314906-6v3otfb7n03viaopsthhmkvmigamj92g.apps.googleusercontent.com";
const authConfig = {
  clientId: "darshak-react-client",
  authorizationEndpoint: "http://localhost:8080/oauth2/authorize",
  tokenEndpoint: "http://localhost:8080/oauth2/token",
  redirectUri: "http://localhost:5173/callback",
  scope: "read",
  autoLogin: false,
  loginMethod: "redirect",
  clearURL: true,
};

const callbackParams = new URLSearchParams(window.location.search);
if (
  window.location.pathname === "/callback" &&
  callbackParams.has("code") &&
  localStorage.getItem("ROCP_PKCE_code_verifier") &&
  localStorage.getItem("ROCP_loginInProgress") !== "true"
) {
  localStorage.setItem("ROCP_loginInProgress", JSON.stringify(true));
}

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <OAuthProvider authConfig={authConfig}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/callback" element={<OAuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </AuthProvider>
      </OAuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
