import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import api from "../../utils/api";

const DepositFunds = ({ onSuccess, wallet }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer", icon: BanknotesIcon },
    { value: "credit_card", label: "Credit Card", icon: CreditCardIcon },
    { value: "debit_card", label: "Debit Card", icon: CreditCardIcon },
    { value: "paypal", label: "PayPal", icon: CreditCardIcon },
  ];

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const handleDeposit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      return;
    }

    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (depositAmount < 100) {
      toast.error("Minimum deposit amount is ₹100");
      return;
    }

    if (depositAmount > 1000000) {
      toast.error("Maximum deposit amount is ₹10,00,000");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/wallet/deposit", {
        amount: depositAmount,
        paymentMethod,
        description:
          description || `Deposit of ₹${depositAmount} via ${paymentMethod}`,
      });

      if (response.data.success) {
        toast.success("Funds deposited successfully!");
        setAmount("");
        setDescription("");
        setShowForm(false);
        if (onSuccess) onSuccess(response.data.data);
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error(error.response?.data?.error || "Failed to deposit funds");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="text-center">
          <PlusIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Funds</h3>
          <p className="text-gray-600 mb-4">
            Deposit money to your wallet to start bidding on auctions
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Deposit Funds
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Deposit Funds</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleDeposit} className="space-y-6">
        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Amounts
          </label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  amount === quickAmount.toString()
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                ₹{quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount (INR)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max="1000000"
              step="1"
              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Minimum: ₹100 | Maximum: ₹10,00,000
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <label
                  key={method.value}
                  className={`relative flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === method.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <IconComponent className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {method.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description (Optional)
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a note for this transaction"
            maxLength={100}
          />
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">Security Notice</p>
              <p className="text-yellow-700">
                This is a demo transaction. In a real application, this would
                integrate with a secure payment gateway like Stripe, PayPal, or
                similar.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !amount}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "Processing..." : `Deposit ₹${amount || "0"}`}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DepositFunds;
