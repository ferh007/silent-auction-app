import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
export default function AuctionList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    // Fetch items from backend API
    api.get("/api/items")
      .then(res => setItems(res.data))
      .catch(err => console.error("Failed to fetch items:", err));
  }, []);
  
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auction Items</h1>
      <input 
        type="text" placeholder="Search items..." 
        className="border p-2 mb-4"
        value={search} onChange={e => setSearch(e.target.value)} 
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item._id} className="border rounded p-4">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover my-2"/>
            <p>{item.description}</p>
            <p className="mt-2">
              Current Bid: <strong>${item.currentPrice || item.basePrice}</strong>
            </p>
            <p>Status: {item.isClosed ? "Closed" : "Open"}</p>
            <Link to={`/item/${item._id}`} className="btn-primary mt-2 inline-block">
              {item.isClosed ? "View Details" : "Place Bid"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
