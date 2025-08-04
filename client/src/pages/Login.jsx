
import { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";  // our Firebase client config

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to auction list or admin dashboard based on role
    } catch (err) {
      console.error("Login failed:", err);
      // Handle error (e.g., show message)
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4 p-6 shadow">
        <h2 className="text-2xl font-bold">Login</h2>
        <input type="email" placeholder="Email" className="input-field" 
               value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="input-field" 
               value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary">Sign In</button>
        <p>Don't have an account? <Link to="/register" className="text-blue-500">Register</Link></p>
      </form>
    </div>
  );
}
