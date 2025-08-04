import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

// Timer component for auction end
function TimeLeft({ endDate }) {
  const [timeLeft, setTimeLeft] = useState('Calculating...');

  useEffect(() => {
    const updateTimer = () => {
      if (!endDate) {
        setTimeLeft('No end date set');
        return;
      }
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;
      if (isNaN(difference)) {
        setTimeLeft('Invalid date');
        return;
      }
      if (difference <= 0) {
        setTimeLeft('Auction ended');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="my-2 p-2 bg-gray-50 rounded text-center">
      <span className="font-semibold">Time Remaining:</span><br />
      <span className={`
        ${timeLeft === 'Auction ended' ? 'text-red-600' : 
          timeLeft === 'No end date set' || timeLeft === 'Invalid date' ? 'text-gray-600' :
          'text-blue-600'
        } font-bold text-lg`}
      >
        {timeLeft}
      </span>
    </div>
  );
}

export default function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/items/${id}`)
      .then(res => {
        setItem(res.data.item);
        setBids(res.data.bids);
      })
      .catch(err => console.error("Error loading item:", err));
  }, [id]);

  const highestBid = item?.currentPrice || item?.basePrice;

  const onBidSubmit = async (e) => {
    e.preventDefault();
    const bidAmount = parseFloat(newBid);

    if (isNaN(bidAmount) || bidAmount <= highestBid) {
      alert(`Bid must be greater than current price ($${highestBid})`);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/items/${id}/bid`, { 
        amount: bidAmount,
        itemId: id // Explicitly include itemId
      });

      setNewBid("");
      alert("Bid placed successfully!");

      // Update UI with new data
      setItem(prev => ({
        ...prev,
        currentPrice: bidAmount,
        currentBidder: response.data.userEmail
      }));

      // Add new bid to history
      setBids(prev => [...prev, {
        amount: bidAmount,
        userEmail: response.data.userEmail,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error("Bid failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });

      // Show specific error message
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "Failed to place bid. Please try again.";
      alert(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{item.title}</h2>
      <img 
        src={item.imageUrl || 'https://placehold.co/300x200'} 
        alt={item.title}
        className="w-full max-w-md my-4"
        onError={(e) => {
          e.target.src = 'https://placehold.co/300x200';
          e.target.onerror = null;
        }}
      />
      <p>{item.description}</p>
      <p>Status: {item.isClosed ? "Closed" : "Open"}</p>
      <p>Highest Bid: <strong>${highestBid}</strong> {item.currentBidder && `by ${item.currentBidder}`}</p>
      {/* Timer above the bid form */}
      <TimeLeft endDate={item.endDate} />
      {!item.isClosed ? (
        <form onSubmit={onBidSubmit} className="mt-4">
          <input
            type="number"
            step="0.01"
            min={highestBid + 0.01}
            value={newBid}
            onChange={e => setNewBid(e.target.value)}
            className="border p-2 mr-2"
            required
            disabled={loading}
          />
          <button 
            type="submit" 
            className="btn-primary disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Placing Bid..." : "Place Bid"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-red-600">This auction is closed.</p>
      )}

      <h3 className="text-xl font-semibold mt-6">Bid History</h3>
      <ul className="list-disc ml-5">
        {bids.map((bid, idx) => (
          <li key={idx}>
            <strong>${bid.amount}</strong> – {bid.userEmail} at {new Date(bid.timestamp).toLocaleString()}
          </li>
        ))}
        {bids.length === 0 && <li>No bids yet.</li>}
      </ul>
    </div>
  );
}




