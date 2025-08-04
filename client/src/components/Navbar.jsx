import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <Link to="/">Silent Auction</Link>
      </div>
      <div className={styles.links}>
        {isAdmin && (
          <Link to="/admin">Admin</Link>
        )}
        <span>{currentUser?.email}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
