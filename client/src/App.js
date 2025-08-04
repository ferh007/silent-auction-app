import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext"; 
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import AuctionList from "./pages/AuctionList";
import ItemDetails from "./pages/ItemDetails.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar"; 
import { io } from "socket.io-client";

// Create and expose socket.io instance
const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});
window.socket = socket;

function App() {
  const { currentUser, isAdmin } = useAuth(); 

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
