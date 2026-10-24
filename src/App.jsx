import { GoogleLogin } from "@react-oauth/google";
import { loginUser, registerUser } from "./api/authService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { saveAuthResponseTokens } from "./auth/authTokens.js";
import { useAppAuth } from "./auth/useAppAuth.js";

import {

  ShieldCheck,

  Zap,

  Users,

  Star,

  Mail,

  LockKeyhole,

  Eye,

  EyeOff,

  ArrowRight,

  Sun,

  Moon,

  CheckCircle2,

} from "lucide-react";

import "./App.css";

const BASE_URL = "http://localhost:8080/api/auth/appUsers";



export default function App() {

  const [mode, setMode] = useState("login");

  const [showPassword, setShowPassword] = useState(false);

  const [dark, setDark] = useState(true);

  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAppAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("oauthLogin") && params.has("error")
      ? "Invalid email or password."
      : "";
  });

  const [form, setForm] = useState({

    name: "",

    email: "",

    password: "",

  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("oauthLogin")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const updateField = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

    setMessage("");

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");



    if (mode === "register" && form.name.trim().length < 2) {

      setMessage("Please enter your full name.");

      return;

    }



    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {

      setMessage("Please enter a valid email address.");

      return;

    }



    if (form.password.length < 8) {

      setMessage("Password must contain at least 8 characters.");

      return;

    }

    if (mode === "login") {

      setIsSubmitting(true);
      try {
        const result = await loginUser({
          userName: form.email.trim(),
          passWord: form.password,
        });
        if (result.code === 0) {
          setMessage(result.message || "Invalid email or password.");
          return;
        }

        const { hasRefreshToken } = saveAuthResponseTokens(result.data);
        setMessage(
          hasRefreshToken
            ? "Login successful!"
            : "Login succeeded, but no refresh token was returned. Automatic refresh is unavailable."
        );
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Invalid email or password."
        );
      } finally {
        setIsSubmitting(false);
      }
      return;

    }

    try {

      const result = await registerUser({

        name: form.name.trim(),

        email: form.email.trim(),

        password: form.password,

      });



      setMessage(

        result.message || "Registration completed successfully!"

      );



      setForm({

        name: "",

        email: "",

        password: "",

      });



      setMode("login");

    } catch (error) {

      const serverMessage =

        error.response?.data?.message ||

        "Registration failed. Please check your backend and try again.";



      setMessage(serverMessage);

    }

  };





  const handleGoogleSuccess = async (response) => {

    try {



      // const result = await fetch(API.GOOGLE_LOGIN, {

      //   method: "POST",

      //   headers: {

      //     "Content-Type": "application/json",

      //   },

      //   body: JSON.stringify({

      //     credential: response.credential,

      //   }),

      // });





      const result = await fetch(

        `${BASE_URL}/google`,

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            credential: response.credential,

          }),

        }

      );

      const data = await result.json();



      console.log("Backend response:", data);



      if (!result.ok || data.code === 0) {

        setMessage(data.message || "Google login failed");

        return;

      }



      const { hasRefreshToken } = saveAuthResponseTokens(data.data);
      setMessage(
        hasRefreshToken
          ? "Google login successful!"
          : "Google login succeeded, but no refresh token was returned. Automatic refresh is unavailable."
      );

    } catch (error) {

      console.error("Google login error:", error);

      setMessage("Unable to connect to backend.");

    }

  };



  const changeMode = (nextMode) => {

    setMode(nextMode);

    setMessage("");

  };



  return (

    <main className={`auth-page ${dark ? "dark" : "light"}`}>

      <div className="ambient ambient-one" />

      <div className="ambient ambient-two" />



      <header className="navbar">

        <a className="brand" href="#home">

          <span className="brand-logo">D</span>

          <span>

            Darshak<span className="brand-light">App</span>

          </span>

        </a>



        <nav className="nav-links">

          <a className="active" href="#home">Home</a>

          <a href="#features">Features</a>

          <a href="#about">About</a>

          <a href="#contact">Contact</a>

        </nav>



        <button

          className="theme-button"

          type="button"

          aria-label="Toggle theme"

          onClick={() => setDark(!dark)}

        >

          {dark ? <Sun size={19} /> : <Moon size={19} />}

        </button>

      </header>



      <section className="main-layout" id="home">

        <div className="hero-section">

          <div className="eyebrow">

            <span className="status-dot" />

            YOUR SPACE. YOUR EXPERIENCE.

          </div>



          <h1>

            Welcome to

            <span className="gradient-text"> DarshakApp.</span>

          </h1>



          <p className="hero-description">

            A smarter, simpler and more secure way to manage

            your account. Everything you need, right where

            you need it.

          </p>



          <div className="feature-grid" id="features">

            <Feature

              icon={<ShieldCheck />}

              color="purple"

              title="Secure by design"

              description="Built with modern authentication practices."

            />



            <Feature

              icon={<Zap />}

              color="blue"

              title="Fast experience"

              description="A smooth experience without the clutter."

            />



            <Feature

              icon={<Users />}

              color="green"

              title="Made for you"

              description="A simple interface that feels natural."

            />



            <Feature

              icon={<Star />}

              color="orange"

              title="Always accessible"

              description="Your account, ready when you are."

            />

          </div>



          <div className="trust-line">

            <div className="avatar-stack">

              <span>D</span>

              <span>A</span>

              <span>J</span>

            </div>



            <div>

              <strong>Simple. Secure. Seamless.</strong>

              <p>Your account journey starts here.</p>

            </div>

          </div>

        </div>



        <section className="auth-card" aria-label="Authentication">

          <div className="card-glow" />



          <div className="auth-card-content">

            <div className="tab-switch">

              <button

                className={mode === "login" ? "selected" : ""}

                onClick={() => changeMode("login")}

                type="button"

              >

                Sign In

              </button>



              <button

                className={mode === "register" ? "selected" : ""}

                onClick={() => changeMode("register")}

                type="button"

              >

                Create Account

              </button>

            </div>



            <div className="form-heading">

              <span className="welcome-icon">

                <CheckCircle2 size={22} />

              </span>



              <h2>

                {mode === "login" ? "Welcome back" : "Join DarshakApp"}

              </h2>



              <p>

                {mode === "login"

                  ? "Enter your details to sign in to your account."

                  : "Create your account and get started today."}

              </p>

            </div>



            <div className="google-area">

              <GoogleLogin

                onSuccess={handleGoogleSuccess}

                onError={() => setMessage("Google sign-in failed.")}

                theme={dark ? "filled_black" : "outline"}

                shape="rectangular"

                size="large"

                text="continue_with"

                width="100%"

              />

            </div>



            <div className="separator">

              <span />

              <small>OR CONTINUE WITH EMAIL</small>

              <span />

            </div>



            <form onSubmit={handleSubmit} noValidate>

              {mode === "register" && (

                <div className="field-group">

                  <label htmlFor="name">Full name</label>



                  <div className="input-wrap">

                    <Users size={18} />



                    <input

                      id="name"

                      name="name"

                      placeholder="Your full name"

                      value={form.name}

                      onChange={updateField}

                      autoComplete="name"

                      required

                    />

                  </div>

                </div>

              )}



              <div className="field-group">

                <label htmlFor="email">Email address</label>



                <div className="input-wrap">

                  <Mail size={18} />



                  <input

                    id="email"

                    name="email"

                    type="email"

                    placeholder="you@example.com"

                    value={form.email}

                    onChange={updateField}

                    autoComplete="email"

                    required

                  />

                </div>

              </div>



              <div className="field-group">

                <label htmlFor="password">Password</label>



                <div className="input-wrap">

                  <LockKeyhole size={18} />



                  <input

                    id="password"

                    name="password"

                    type={showPassword ? "text" : "password"}

                    placeholder="At least 8 characters"

                    value={form.password}

                    onChange={updateField}

                    autoComplete={

                      mode === "login"

                        ? "current-password"

                        : "new-password"

                    }

                    required

                    minLength={8}

                  />



                  <button

                    className="password-toggle"

                    type="button"

                    aria-label={

                      showPassword ? "Hide password" : "Show password"

                    }

                    onClick={() => setShowPassword(!showPassword)}

                  >

                    {showPassword

                      ? <EyeOff size={18} />

                      : <Eye size={18} />}

                  </button>

                </div>

              </div>



              {mode === "login" && (

                <div className="form-options">

                  <label className="remember-option">

                    <input

                      type="checkbox"

                      checked={remember}

                      onChange={(e) => setRemember(e.target.checked)}

                    />

                    <span>Remember me</span>

                  </label>



                  <button

                    className="text-button"

                    type="button"

                    onClick={() =>

                      setMessage("Password reset will be added later.")

                    }

                  >

                    Forgot password?

                  </button>

                </div>

              )}



              {message && (

                <div className="form-message" role="status">

                  {message}

                </div>

              )}



              <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
              >

                {isSubmitting
                  ? "Signing in..."
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}

                <ArrowRight size={19} />

              </button>

            </form>



            <p className="bottom-switch">

              {mode === "login"

                ? "Don't have an account?"

                : "Already have an account?"}



              <button

                type="button"

                onClick={() =>

                  changeMode(mode === "login" ? "register" : "login")

                }

              >

                {mode === "login" ? "Create account" : "Sign in"}

              </button>

            </p>



            <div className="card-footer">

              <ShieldCheck size={15} />

              <span>Your information is handled securely.</span>

            </div>

          </div>

        </section>

      </section>



      <footer className="page-footer" id="contact">

        <span>© 2026 DarshakApp</span>

        <span>

          Built with care <span className="footer-heart">♥</span>

        </span>



        <div id="about">

          <a href="#about">Privacy</a>

          <a href="#about">Terms</a>

        </div>

      </footer>

    </main>

  );

}



function Feature({ icon, color, title, description }) {

  return (

    <article className="feature-card">

      <div className={`feature-icon ${color}`}>{icon}</div>



      <div>

        <h3>{title}</h3>

        <p>{description}</p>

      </div>

    </article>

  );

}
