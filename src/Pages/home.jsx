import React from 'react';
import { ArrowRight, Timer, Shield, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const featuredAuctions = [
    {
      id: 1,
      title: "Vintage Rolex Submariner",
      image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&w=800&q=80",
      currentBid: 15000,
      timeLeft: "2h 15m",
    },
    {
      id: 2,
      title: "Modern Art Collection",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
      currentBid: 8500,
      timeLeft: "4h 30m",
    },
    {
      id: 3,
      title: "Classic Ferrari Model",
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
      currentBid: 25000,
      timeLeft: "1d 3h",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80"
            alt="Auction Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-5xl font-bold mb-6">Where Every Bid Tells a Story</h1>
          <p className="text-xl mb-8 max-w-2xl">
          Your trusted platform for online auctions. Discover unique items and bid with confidence.
          </p>
          <Link
            to="/auctions"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Start Bidding <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      {/*}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <Timer className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Bidding</h3>
            <p className="text-gray-600">
              Experience the thrill of live auctions with our real-time bidding system
            </p>
          </div>
          <div className="text-center p-6">
            <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-gray-600">
              Your bids and payments are protected by our advanced security system
            </p>
          </div>
          <div className="text-center p-6">
            <Trophy className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Verification</h3>
            <p className="text-gray-600">
              All items are verified by experts to ensure authenticity
            </p>
          </div>
        </div>
  </section> */}

      {/* Featured Auctions */}
    {/*
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Featured Auctions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredAuctions.map((auction) => (
            <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={auction.image}
                alt={auction.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{auction.title}</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">Current Bid</p>
                    <p className="text-lg font-bold">${auction.currentBid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time Left</p>
                    <p className="text-lg font-bold">{auction.timeLeft}</p>
                  </div>
                </div>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
        </section> */}
      
    </div>
  );
};

export default Home;