import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function TimeLeft({ endTime, onEnd }) {
  const [timeLeft, setTimeLeft] = useState('Calculating...');

  useEffect(() => {
    const updateTimer = () => {
      if (!endTime) {
        setTimeLeft('No end date set');
        return;
      }

      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (isNaN(difference)) {
        console.error('Invalid date calculation:', { endTime, end, now });
        setTimeLeft('Invalid date');
        return;
      }

      if (difference <= 0) {
        setTimeLeft('Auction ended');
        onEnd?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    // Initial update
    updateTimer();
    
    // Set up interval
    const timer = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  return (
    <div className="my-2 p-2 bg-gray-50 rounded text-center">
      <span className="font-semibold">Time Remaining:</span><br />
      <span className={`
        ${timeLeft === 'Auction ended' ? 'text-red-600' : 
          timeLeft === 'Time not set' || timeLeft === 'Invalid date' ? 'text-gray-600' :
          'text-blue-600'
        } font-bold text-lg`}
      >
        {timeLeft}
      </span>
    </div>
  );
}

export default function AuctionList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Initial fetch
    fetchItems();

    // Listen for real-time updates
    const socket = window.socket;
    
    if (socket) {
      socket.on('itemUpdated', (updatedItem) => {
        setItems(prevItems => 
          prevItems.map(item => 
            item._id === updatedItem._id ? updatedItem : item
          )
        );
      });

      socket.on('auctionEnded', (itemId) => {
        setItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, isClosed: true } : item
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('itemUpdated');
        socket.off('auctionEnded');
      }
    };
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");
      console.log('Fetched items:', res.data); // Debug log
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else if (Array.isArray(res.data.items)) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
    }
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(item =>
        item.title?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auction Items</h1>
      <input
        type="text"
        placeholder="Search items..."
        className="border p-2 mb-4"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item._id} className="border rounded p-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-40 object-cover my-2"
            />
            <p>{item.description}</p>
            <p className="mt-2">
              Current Bid:{" "}
              <strong>${item.currentPrice || item.basePrice}</strong>
            </p>
            <p>Status: {item.isClosed ? "Closed" : "Open"}</p>
            <TimeLeft endTime={item.endDate} />
            <Link
              to={`/item/${item._id}`}
              className="btn-primary mt-2 inline-block"
            >
              {item.isClosed ? "View Details" : "Place Bid"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

