import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext"; // ✅ FIXED import
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import AuctionList from "./pages/AuctionList";
import ItemDetails from "./pages/ItemDetails.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar"; // 
import { io } from "socket.io-client";

// ✅ Create and expose socket.io instance
const socket = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000");
window.socket = socket;

function App() {
  const { currentUser, isAdmin } = useAuth(); // ✅ Now properly imported

  return (
    <Router>
      {currentUser && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />

        {/* Protected routes */}
        <Route path="/" element={currentUser ? <AuctionList /> : <Navigate to="/login" />} />
        <Route path="/item/:id" element={currentUser ? <ItemDetails /> : <Navigate to="/login" />} />

        {/* Admin route */}
        <Route path="/admin" element={currentUser && isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
