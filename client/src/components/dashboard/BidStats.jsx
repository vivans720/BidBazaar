import React, { useState, useEffect } from "react";
import { getBidStats } from "../../utils/api";
import { formatCurrency } from "../../utils/format";

// Component to display platform-wide bid statistics
const BidStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    activeBids: 0,
    wonBids: 0,
    lostBids: 0,
    highestBidAmount: 0,
    averageBidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBidStats = async () => {
      try {
        setLoading(true);
        const response = await getBidStats();
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bid statistics:", err);
        setError("Failed to load bid statistics");
        setLoading(false);
      }
    };

    fetchBidStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Platform Bid Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Platform Bid Statistics
        </h3>
        <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Bids",
      value: stats.total,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Bids Today",
      value: stats.today,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Active Bids",
      value: stats.activeBids,
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "Won Bids",
      value: stats.wonBids,
      color: "bg-amber-100 text-amber-800",
    },
    {
      label: "Lost Bids",
      value: stats.lostBids,
      color: "bg-red-100 text-red-800",
    },
    {
      label: "Highest Bid",
      value: formatCurrency(stats.highestBidAmount),
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      label: "Average Bid",
      value: formatCurrency(stats.averageBidAmount),
      color: "bg-fuchsia-100 text-fuchsia-800",
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Platform Bid Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${item.color.split(" ")[0]}`}
          >
            <p className="text-sm font-medium">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color.split(" ")[1]}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidStats;
