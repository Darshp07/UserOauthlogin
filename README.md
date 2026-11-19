# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Authentication

The React app submits email/password credentials to Spring Security's
`POST http://localhost:8080/login` form endpoint. After the server accepts them,
Spring Authorization Server redirects to React's OAuth2 PKCE flow. Google
sign-in starts at `http://localhost:8080/oauth2/authorization/google`.
Registration uses `POST http://localhost:8080/api/auth/appUsers/register`.

The Java backend runs on port `8080`. In Google Cloud Console, register this
exact authorized redirect URI for the backend's Google **Web application**
OAuth client:

```text
http://localhost:8080/login/oauth2/code/google
```

Configure the Spring backend to use the same Google client ID and secret, and
keep the callback template and scopes aligned with the Google sign-in flow:

```properties
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the **backend** environment;
never put the client secret in the React app or a `VITE_` variable. The redirect
URI must match exactly in Google Cloud Console and the backend. After a
successful Google callback, the backend should redirect to
`http://localhost:5173/?google=success`; the frontend then starts its
OAuth2 authorization-code/PKCE sign-in. Keep `VITE_BACKEND_URL` unset for the
default local backend or set it to the backend origin.

If the page returns with `?oauthLogin&error=google`, the frontend has received a
failure redirect from Spring. Check the backend logs for the underlying OAuth
exception, verify the Google client ID/secret belong to the same OAuth client,
and confirm the authorized redirect URI above. A `redirect_uri_mismatch`
response means the Google Console URI differs from the callback Spring sent.
