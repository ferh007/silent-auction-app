import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import styles from "./AuthForm.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate(isAdmin ? "/admin" : "/");
    }
  }, [currentUser, isAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false); // Reset loading state after success
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage = {
        "auth/invalid-credential": "Invalid email or password",
        "auth/user-disabled": "This account has been disabled",
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Invalid email or password",
        "auth/too-many-requests": "Too many failed attempts. Please try again later"
      }[err.code] || "Failed to login. Please try again.";
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={styles["auth-bg"]}>
      <div className={styles["auth-card"]}>
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <h2 className={styles["auth-title"]}>Sign In</h2>
          {error && (
            <div className={styles["auth-error"]}>{error}</div>
          )}
          <div style={{ marginBottom: '1.2rem' }}>
            <label className={styles["auth-label"]}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles["auth-input"]}
              required
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label className={styles["auth-label"]}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles["auth-input"]}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles["auth-btn"]}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className={styles["auth-footer"]}>
            Don't have an account?{' '}
            <Link to="/register" className={styles["auth-link"]}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
