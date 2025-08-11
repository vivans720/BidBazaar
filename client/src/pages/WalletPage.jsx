import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import WalletBalance from "../components/wallet/WalletBalance";
import DepositFunds from "../components/wallet/DepositFunds";
import api from "../utils/api";
import { formatCurrency } from "../utils/format";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const WalletPage = () => {
  const { state } = useAuth();
  const { user } = state;
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await api.get("/wallet");
      setWallet(response.data.data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (pageNum = 1, reset = false) => {
    try {
      setTransactionsLoading(true);
      const response = await api.get(
        `/wallet/transactions?page=${pageNum}&limit=10`
      );
      const newTransactions = response.data.data;

      if (reset) {
        setTransactions(newTransactions);
      } else {
        setTransactions((prev) => [...prev, ...newTransactions]);
      }

      setHasMore(response.data.pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleDepositSuccess = (updatedWallet) => {
    setWallet(updatedWallet.wallet);
    fetchTransactions(1, true); // Refresh transactions
  };

  const loadMoreTransactions = () => {
    if (!transactionsLoading && hasMore) {
      fetchTransactions(page + 1);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      case "withdrawal":
        return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
      case "bid":
        return <ArrowDownIcon className="h-5 w-5 text-blue-500" />;
      case "bid_refund":
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      case "auction_win":
        return <CheckCircleIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "deposit":
      case "bid_refund":
        return "text-green-600";
      case "withdrawal":
      case "bid":
        return "text-red-600";
      case "auction_win":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTransactionType = (type) => {
    const types = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      bid: "Bid Placed",
      bid_refund: "Bid Refund",
      auction_win: "Auction Won",
      auction_refund: "Auction Refund",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-lg bg-gray-300 h-32 w-96 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="mt-2 text-gray-600">
            Manage your funds and track your transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet Balance and Deposit */}
          <div className="lg:col-span-1 space-y-6">
            <WalletBalance />
            <DepositFunds onSuccess={handleDepositSuccess} wallet={wallet} />
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Transaction History
              </h3>

              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400">
                    Your transaction history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatTransactionType(transaction.type)}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${getTransactionColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Balance: {formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMoreTransactions}
                        disabled={transactionsLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {transactionsLoading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
