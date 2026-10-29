
import { useState } from "react";
import { BookOpen, BookBookmark, UserRound, LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "https://acadtrack-pkrg.onrender.com";
console.log("acad API_URL:", API_URL);

export default function Login({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            isRegister
              ? { name, username, email, password }
              : { login, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      onAuthenticated(data.user);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Check if the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setLogin("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <main className="login-page">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand-icon">
          <BookBookmark size={28} strokeWidth={2.2} />
        </div>

        <h1>Acad<span>emix</span></h1>

        <p className="login-subtitle">
          {isRegister
            ? "Create your student account and stay on track."
            : "Welcome back! Let's get your studies on track."}
        </p>

        <div className="login-form-fields">
          {isRegister && (
            <>
              <label className="login-field">
                <span>Student Name</span>
                <div className="login-input-wrap">
                  <UserRound size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </div>
              </label>

              <label className="login-field">
                <span>Username</span>
                <div className="login-input-wrap">
                  <UserRound size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase())
                    }
                    placeholder="Create a username"
                    minLength={3}
                    maxLength={30}
                    pattern="[a-z0-9_]+"
                    title="Use lowercase letters, numbers, and underscores only."
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="login-field">
                <span>Email Address</span>
                <div className="login-input-wrap">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    maxLength={254}
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
            </>
          )}

          {!isRegister && (
            <label className="login-field">
              <span>Username or Email</span>
              <div className="login-input-wrap">
                <UserRound size={18} />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Enter username or email"
                  autoComplete="username"
                  required
                />
              </div>
            </label>
          )}

          <label className="login-field">
            <span>Password</span>
            <div className="login-input-wrap">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isRegister ? "At least 8 characters" : "Enter your password"
                }
                minLength={isRegister ? 8 : undefined}
                maxLength={72}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {isRegister && (
            <label className="login-field">
              <span>Confirm Password</span>
              <div className="login-input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <small
                  className={
                    password === confirmPassword
                      ? "password-match"
                      : "password-mismatch"
                  }
                >
                  {password === confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </small>
              )}
            </label>
          )}
        </div>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="login-submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isRegister
              ? "Create Account"
              : "Log In"}
        </button>

        <p className="login-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            className="login-link"
            onClick={switchMode}
          >
            {isRegister ? "Log In" : "Register"}
          </button>
        </p>

        <p className="login-footer">
          Your academic journey, organized.
        </p>
      </form>
    </main>
  );
}
