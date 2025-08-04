import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    imageUrl: '',
    basePrice: '',
    endDate: ''
  });
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/');
      return;
    }

    const fetchItems = async () => {
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

    fetchItems();
  }, [currentUser, isAdmin, navigate]);

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
      console.error("Failed to delete auction:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      alert(err.response?.data?.message || "Error deleting auction");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate endDate before submitting
    if (!newItem.endDate) {
      alert("End date is required.");
      return;
    }
    const formattedEndDate = new Date(newItem.endDate);
    if (isNaN(formattedEndDate.getTime())) {
      alert("End date is invalid.");
      return;
    }

    // Log payload for debugging
    console.log('Submitting new auction item:', {
      title: newItem.title,
      description: newItem.description,
      imageUrl: newItem.imageUrl,
      basePrice: parseFloat(newItem.basePrice),
      endDate: formattedEndDate.toISOString()
    });

    try {
      const response = await api.post('/api/items', {
        title: newItem.title,
        description: newItem.description,
        imageUrl: newItem.imageUrl,
        basePrice: parseFloat(newItem.basePrice),
        endDate: formattedEndDate.toISOString()
      });
      setItems(prev => [...prev, response.data]);
      setNewItem({
        title: '',
        description: '',
        imageUrl: '',
        basePrice: '',
        endDate: ''
      });
      setShowForm(false);
      alert('New auction item created successfully!');
    } catch (err) {
      console.error('Failed to create item:', err);
      alert(err.response?.data?.message || 'Error creating auction item');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={newItem.title}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={newItem.imageUrl}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Base Price ($)</label>
              <input
                type="number"
                name="basePrice"
                value={newItem.basePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                value={newItem.endDate}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={newItem.description}
                onChange={handleChange}
                className="w-full border rounded p-2"
                rows="3"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Auction Item
            </button>
          </div>
        </form>
      )}

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
