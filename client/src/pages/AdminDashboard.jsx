import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      if (currentUser.email !== process.env.REACT_APP_ADMIN_EMAIL) {
        navigate('/');
        return;
      }

      try {
        const res = await api.get("/api/items");
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        alert("Error loading items");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [currentUser, navigate]);

  const closeAuction = async (itemId) => {
    if (!window.confirm("Close this auction? This will determine a winner.")) return;

    try {
      const res = await api.patch(`/api/items/${itemId}/close`);
      setItems(prev => prev.map(item => 
        item._id === itemId ? res.data : item
      ));
      alert(`Auction closed. Winner: ${res.data.winnerEmail || 'No bids'}`);
    } catch (err) {
      console.error("Failed to close auction:", err);
      alert(err.response?.data?.message || "Error closing auction");
    }
  };

  const deleteAuction = async (itemId) => {
    if (!window.confirm("Delete this auction? This cannot be undone.")) return;

    try {
      await api.delete(`/api/items/${itemId}`);
      setItems(prev => prev.filter(item => item._id !== itemId));
      alert("Auction deleted successfully");
    } catch (err) {
      console.error("Failed to delete auction:", err);
      alert(err.response?.data?.message || "Error deleting auction");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Manage auction items and view bidding status.</p>

      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-2">Item</th>
            <th className="py-2 px-2">Highest Bid</th>
            <th className="py-2 px-2">Status</th>
            <th className="py-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id} className="border-b">
              <td className="py-1 px-2">{item.title}</td>
              <td className="py-1 px-2">${item.currentPrice || item.basePrice}</td>
              <td className="py-1 px-2">{item.isClosed ? "Closed" : "Open"}</td>
              <td className="py-1 px-2 space-x-2">
                {!item.isClosed && (
                  <button
                    onClick={() => closeAuction(item._id)}
                    className="btn-secondary bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => deleteAuction(item._id)}
                  className="btn-secondary bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
