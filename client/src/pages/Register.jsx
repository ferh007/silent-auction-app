import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import styles from "./AuthForm.module.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, {
        displayName: form.displayName,
      });
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message);
    }
  };

  return (
    <div className={styles["auth-bg"]}>
      <div className={styles["auth-card"]}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <h2 className={styles["auth-title"]}>Register</h2>
          <div style={{ marginBottom: '1.2rem' }}>
            <label className={styles["auth-label"]}>Name</label>
            <input
              type="text"
              name="displayName"
              placeholder="Name"
              value={form.displayName}
              onChange={handleChange}
              required
              className={styles["auth-input"]}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label className={styles["auth-label"]}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxShadow: '0 2px 8px rgba(44,62,80,0.04)', marginBottom: '0.2rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label className={styles["auth-label"]}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className={styles["auth-input"]}
            />
          </div>
          <button type="submit" className={`${styles["auth-btn"]} ${styles["auth-btn-green"]}`}>Register</button>
        </form>
        {error && <div className={styles["auth-error"]}>{error}</div>}
      </div>
    </div>
  );
}
