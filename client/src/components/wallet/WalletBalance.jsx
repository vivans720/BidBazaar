import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../../utils/format";
import api from "../../utils/api";

const WalletBalance = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await api.get("/wallet");
      setWallet(response.data.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      setError("Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CreditCardIcon className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Wallet Balance
          </h3>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {showBalance ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900">
          {showBalance ? formatCurrency(wallet?.balance || 0) : "****"}
        </p>
        <p className="text-gray-500 text-sm">Available for bidding</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center space-x-1 mb-1">
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Last Deposit</span>
          </div>
          <p className="font-semibold text-gray-900">
            {wallet?.lastTransaction
              ? new Date(wallet.lastTransaction).toLocaleDateString()
              : "No transactions"}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center space-x-1 mb-1">
            <CreditCardIcon className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">Currency</span>
          </div>
          <p className="font-semibold text-gray-900">
            {wallet?.currency || "INR"}
          </p>
        </div>
      </div>

      {wallet?.balance < 100 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Low balance! Add funds to continue bidding on auctions.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WalletBalance;
