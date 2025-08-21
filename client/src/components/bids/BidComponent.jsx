import React, { useState, useEffect } from "react";
import { placeBid, getProductBids } from "../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

// Import icons
import {
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const BidComponent = ({
  productId,
  currentPrice,
  refreshProduct,
  startingPrice,
}) => {
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [validBidAmounts, setValidBidAmounts] = useState([]);
  const [showBidTips, setShowBidTips] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);
  const { state, user, isAuthenticated } = useAuth();

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fetch bids on component mount and when productId changes
  useEffect(() => {
    if (productId) {
      fetchBids();
    }
  }, [productId]);

  // Calculate valid bid amounts based on 5% increments from starting price
  useEffect(() => {
    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("BidComponent - Calculating valid bid amounts:", {
        startingPrice,
        currentPrice,
        hasStartingPrice: !!startingPrice,
        hasCurrentPrice: !!currentPrice,
        startingPriceType: typeof startingPrice,
        currentPriceType: typeof currentPrice,
      });
    }

    // Ensure we have valid numeric values
    const validStartingPrice =
      startingPrice && !isNaN(startingPrice) ? Number(startingPrice) : null;
    const validCurrentPrice =
      currentPrice && !isNaN(currentPrice) ? Number(currentPrice) : null;

    if (validStartingPrice && validStartingPrice > 0) {
      const increment = Math.ceil(validStartingPrice * 0.05);
      const amounts = [];
      let value = Math.max(validStartingPrice, validCurrentPrice || 0);

      // Generate valid bid amounts
      for (let i = 0; i < 15; i++) {
        value += increment;
        amounts.push(Math.round(value)); // Ensure whole numbers
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "BidComponent - Generated valid amounts:",
          amounts.slice(0, 5)
        );
      }
      setValidBidAmounts(amounts);
      setUseManualInput(false);
    } else if (validCurrentPrice && validCurrentPrice > 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "BidComponent - Using fallback calculation with currentPrice:",
          validCurrentPrice
        );
      }
      const increment = Math.ceil(validCurrentPrice * 0.05); // 5% increment without minimum
      const amounts = [];
      let value = validCurrentPrice;

      for (let i = 0; i < 10; i++) {
        value += increment;
        amounts.push(Math.round(value));
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "BidComponent - Fallback amounts generated:",
          amounts.slice(0, 5)
        );
      }
      setValidBidAmounts(amounts);
      setUseManualInput(false);
    } else {
      console.error(
        "BidComponent - Cannot calculate bid amounts. No valid starting or current price:",
        {
          startingPrice: validStartingPrice,
          currentPrice: validCurrentPrice,
        }
      );
      // Force manual input if we can't calculate amounts
      setValidBidAmounts([]);
      setUseManualInput(true);
    }
  }, [startingPrice, currentPrice]);

  // Function to fetch bids
  const fetchBids = async () => {
    setIsLoadingBids(true);
    try {
      const response = await getProductBids(productId);
      setBids(response.data);
    } catch (error) {
      console.error("Error fetching bids:", error);
    } finally {
      setIsLoadingBids(false);
    }
  };

  // Get next valid bid amount
  const getNextValidBidAmount = () => {
    const validCurrentPrice =
      currentPrice && !isNaN(currentPrice) ? Number(currentPrice) : 0;
    const validStartingPrice =
      startingPrice && !isNaN(startingPrice) ? Number(startingPrice) : 0;

    // Find the first valid bid amount that is higher than the current price
    const nextValidAmount = validBidAmounts.find(
      (amount) => amount > validCurrentPrice
    );

    // Fallback calculation if validBidAmounts is empty
    if (!nextValidAmount && validStartingPrice) {
      const increment = Math.ceil(validStartingPrice * 0.05);
      return Math.max(validCurrentPrice, validStartingPrice) + increment;
    } else if (!nextValidAmount && validCurrentPrice) {
      const increment = Math.ceil(validCurrentPrice * 0.05);
      return validCurrentPrice + increment;
    }

    return nextValidAmount || validCurrentPrice + 100; // Final fallback
  };

  // Handle bid submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDetails(null);

    // Prevent double submission
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const errorMsg = "Please log in to place a bid";
      setErrorDetails({
        message: errorMsg,
        authState: {
          isAuthenticated,
          hasToken: Boolean(state.token),
          hasUser: Boolean(user),
          userRole: user?.role || "unknown",
        },
      });
      toast.error(errorMsg);
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error("Please select a valid bid amount");
      return;
    }

    const nextValidBid = getNextValidBidAmount();
    const bidAmountFloat = parseFloat(bidAmount);
    const validCurrentPrice =
      currentPrice && !isNaN(currentPrice) ? Number(currentPrice) : 0;

    if (bidAmountFloat <= validCurrentPrice) {
      toast.error(
        `Bid amount must be higher than current price (${formatPrice(
          validCurrentPrice
        )})`
      );
      return;
    }

    if (bidAmountFloat < nextValidBid) {
      toast.error(`Minimum bid amount is ${formatPrice(nextValidBid)}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await placeBid(productId, parseFloat(bidAmount));
      console.log("Bid placed successfully:", response);

      // Show appropriate success message based on response
      const { data } = response.data;
      if (data.previousBid > 0) {
        toast.success(
          `Bid increased! ${formatPrice(
            data.amountDeducted
          )} deducted from wallet`
        );
      } else {
        toast.success(
          `Bid placed! ${formatPrice(data.amountDeducted)} deducted from wallet`
        );
      }

      setBidAmount("");
      fetchBids(); // Refresh bids list
      if (refreshProduct) refreshProduct(); // Refresh product details if callback provided
    } catch (error) {
      console.error("Error placing bid:", error);
      const errorMsg = error.response?.data?.error || "Failed to place bid";
      const statusCode = error.response?.status;

      setErrorDetails({
        message: errorMsg,
        status: statusCode,
        authState: {
          isAuthenticated,
          hasToken: Boolean(state.token),
          hasUser: Boolean(user),
          userRole: user?.role || "unknown",
        },
      });

      if (statusCode === 401) {
        toast.error("Authentication error. Please try logging in again.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum next valid bid
  const minimumBid = getNextValidBidAmount();
  const validCurrentPrice =
    currentPrice && !isNaN(currentPrice) ? Number(currentPrice) : 0;

  return (
    <div className="p-6">
      <div className="flex flex-col items-start mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Place Your Bid</h3>
        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-gray-500">Bid now to win this auction</p>
          <button
            onClick={() => setShowBidTips(!showBidTips)}
            className="text-primary-600 text-sm font-medium flex items-center hover:text-primary-800 focus:outline-none"
          >
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            Bidding tips
          </button>
        </div>
      </div>

      {/* Bidding Tips */}
      {showBidTips && (
        <div className="bg-primary-50 rounded-lg p-4 mb-6 border border-primary-100">
          <h4 className="text-sm font-medium text-primary-900 mb-2 flex items-center">
            <ShieldCheckIcon className="w-4 h-4 mr-1 text-primary-600" />
            Bidding Tips
          </h4>
          <ul className="text-xs text-primary-700 space-y-1 pl-6 list-disc">
            <li>Bids must increase in 5% increments from the base price</li>
            <li>
              Your bid is binding - you agree to purchase the item if you win
            </li>
            <li>Set a higher bid to increase your chances of winning</li>
            <li>You'll receive a notification if someone outbids you</li>
          </ul>
        </div>
      )}

      {/* Current Price Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Current bid</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(validCurrentPrice)}
            </p>
          </div>
          <div className="bg-primary-50 text-primary-800 px-3 py-1 rounded-full text-xs font-medium border border-primary-100">
            {bids.length} {bids.length === 1 ? "bid" : "bids"} placed
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center">
          <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-xs text-gray-500">
            Minimum next bid:{" "}
            <span className="font-medium text-primary-600">
              {formatPrice(minimumBid)}
            </span>
          </span>
        </div>
      </div>

      {isAuthenticated ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="bidAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your bid amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                </div>

                {!useManualInput && validBidAmounts.length > 0 ? (
                  <>
                    <select
                      id="bidAmount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm appearance-none bg-white"
                      required
                    >
                      <option value="" disabled>
                        Select a bid amount
                      </option>
                      {validBidAmounts
                        .filter((amount) => amount > validCurrentPrice)
                        .slice(0, 10) // Limit to 10 options
                        .map((amount, index) => (
                          <option key={`bid-${amount}-${index}`} value={amount}>
                            {formatPrice(amount)}{" "}
                            {index === 0 ? "(Minimum bid)" : ""}
                          </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </>
                ) : (
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minimumBid}
                    step="1"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                    placeholder={`Enter amount (min: ${formatPrice(
                      minimumBid
                    )})`}
                    required
                  />
                )}
              </div>

              {validBidAmounts.length === 0 && !useManualInput && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setUseManualInput(true)}
                    className="text-xs text-primary-600 hover:text-primary-500 underline"
                  >
                    Can't see bid options? Enter amount manually
                  </button>
                </div>
              )}

              {useManualInput && validBidAmounts.length > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualInput(false);
                      setBidAmount("");
                    }}
                    className="text-xs text-primary-600 hover:text-primary-500 underline"
                  >
                    Switch back to dropdown selection
                  </button>
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                Bid in increments of{" "}
                {startingPrice
                  ? formatPrice(Math.ceil(startingPrice * 0.05))
                  : "₹5"}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>Place Bid</>
              )}
            </button>

            {errorDetails && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="font-medium">{errorDetails.message}</p>
                {errorDetails.status === 401 && (
                  <p className="mt-1">
                    Please try logging in again to resolve this issue.
                  </p>
                )}
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 mb-3">
            Sign in to place a bid on this item
          </p>
          <Link
            to="/login"
            className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium focus:outline-none transition-colors"
          >
            Sign in to Bid{" "}
            <ArrowRightIcon className="inline-block h-4 w-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default BidComponent;
