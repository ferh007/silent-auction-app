import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/items")
      .then(res => setItems(res.data))
      .catch(err => console.error("Failed to fetch items:", err));
  }, []);

  const closeAuction = (itemId) => {
    if (!window.confirm("Close this auction? This will determine a winner.")) return;

    api.patch(`/api/items/${itemId}/close`)
      .then(res => {
        const updatedItem = res.data;
        setItems(prev => prev.map(item => item._id === itemId ? updatedItem : item));
        alert(`Auction closed. Winner: ${updatedItem.winnerEmail || 'No bids'}`);
      })
      .catch(err => {
        console.error("Failed to close auction:", err);
        alert(err.response?.data?.message || "Error closing auction");
      });
  };

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
              <td className="py-1 px-2">
                {!item.isClosed ? (
                  <button
                    onClick={() => closeAuction(item._id)}
                    className="btn-secondary bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Close Auction
                  </button>
                ) : (
                  <span>Winner: {item.winnerEmail || "None"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Optional: Add item creation UI here */}
    </div>
  );
}
