import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  TruckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (questionId) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const faqCategories = [
    {
      id: "general",
      name: "General",
      icon: QuestionMarkCircleIcon,
      color: "blue",
    },
    {
      id: "bidding",
      name: "Bidding",
      icon: UserGroupIcon,
      color: "green",
    },
    {
      id: "payments",
      name: "Payments",
      icon: CreditCardIcon,
      color: "purple",
    },
    {
      id: "shipping",
      name: "Shipping",
      icon: TruckIcon,
      color: "orange",
    },
    {
      id: "security",
      name: "Security",
      icon: ShieldCheckIcon,
      color: "red",
    },
    {
      id: "seller",
      name: "Selling",
      icon: ExclamationTriangleIcon,
      color: "indigo",
    },
  ];

  const faqData = {
    general: [
      {
        id: "what-is-bidbazaar",
        question: "What is BidBazaar?",
        answer:
          "BidBazaar is an online auction platform where users can buy and sell unique items through competitive bidding. We connect buyers with sellers from around the world, offering a secure and exciting way to discover rare and valuable products.",
      },
      {
        id: "how-to-get-started",
        question: "How do I get started on BidBazaar?",
        answer:
          'Getting started is easy! Simply create a free account by clicking "Register" and choosing whether you want to be a buyer, seller, or both. Once registered, you can start browsing auctions, placing bids, or listing your own items for sale.',
      },
      {
        id: "account-types",
        question: "What are the different types of accounts?",
        answer:
          "We offer three account types: Buyer accounts for purchasing items, Vendor accounts for selling items, and Admin accounts for platform management. You can upgrade your account type at any time from your profile settings.",
      },
      {
        id: "fees",
        question: "Are there any fees to use BidBazaar?",
        answer:
          "Creating an account and browsing auctions is completely free. We charge a small commission fee only when you successfully sell an item. Buyers don't pay any additional fees beyond the winning bid amount.",
      },
      {
        id: "support",
        question: "How can I contact customer support?",
        answer:
          "Our customer support team is available 24/7 through multiple channels: email support at bidbazaar00@gmail.com, live chat on our website, or through the contact form on our Contact page. We typically respond within 2-4 hours.",
      },
    ],
    bidding: [
      {
        id: "how-bidding-works",
        question: "How does the bidding process work?",
        answer:
          "Bidding is simple! Find an item you want, enter your bid amount (which must be higher than the current bid), and submit. You'll be notified if someone outbids you. The highest bidder when the auction ends wins the item.",
      },
      {
        id: "minimum-bid",
        question: "What is the minimum bid increment?",
        answer:
          "The minimum bid increment is automatically calculated based on the current bid amount. For items under ₹1,000, the increment is ₹50. For higher-value items, increments increase proportionally to ensure meaningful bidding competition.",
      },
      {
        id: "bid-retraction",
        question: "Can I retract my bid?",
        answer:
          "Bids are generally binding and cannot be retracted. However, in exceptional circumstances (such as entering the wrong amount), you can contact our support team within 1 hour of placing the bid. Repeated bid retractions may result in account restrictions.",
      },
      {
        id: "automatic-bidding",
        question: "Do you have automatic bidding?",
        answer:
          "Currently, we don't offer automatic bidding features. All bids must be placed manually. This ensures a fair and transparent bidding process where all participants actively engage in the auction.",
      },
      {
        id: "auction-end",
        question: "When do auctions end?",
        answer:
          "Each auction has a specific end time displayed on the product page. Auctions end exactly at the specified time. If a bid is placed in the final minutes, the auction may be extended by a few minutes to allow for fair competition.",
      },
      {
        id: "winning-bid",
        question: "What happens when I win an auction?",
        answer:
          "Congratulations! When you win, you'll receive an email notification and the winning amount will be deducted from your wallet. You'll then be connected with the seller to arrange payment completion and shipping details.",
      },
    ],
    payments: [
      {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        answer:
          "We accept multiple payment methods including credit/debit cards, bank transfers, UPI, and digital wallets. All payments are processed through our secure wallet system for your protection.",
      },
      {
        id: "wallet-system",
        question: "How does the wallet system work?",
        answer:
          "Our wallet system allows you to add funds in advance, making bidding faster and more secure. When you win an auction, the amount is instantly deducted from your wallet balance. You can add funds anytime from your wallet page.",
      },
      {
        id: "payment-security",
        question: "Is my payment information secure?",
        answer:
          "Absolutely! We use industry-standard SSL encryption and comply with PCI DSS security standards. Your payment information is never stored on our servers and is processed through secure, certified payment gateways.",
      },
      {
        id: "refunds",
        question: "What is your refund policy?",
        answer:
          "If you don't win an auction, any held funds are immediately returned to your wallet. For won auctions, refunds are only available if the seller fails to deliver or the item is significantly different from the description.",
      },
      {
        id: "seller-payment",
        question: "When do sellers receive payment?",
        answer:
          "Sellers receive payment after the buyer confirms receipt of the item or after 7 days of delivery confirmation, whichever comes first. This ensures buyer protection while guaranteeing sellers receive their payment.",
      },
    ],
    shipping: [
      {
        id: "shipping-cost",
        question: "Who pays for shipping?",
        answer:
          "Shipping costs are typically paid by the buyer and are separate from the auction price. Shipping details and costs are clearly mentioned in each product listing before you place your bid.",
      },
      {
        id: "shipping-time",
        question: "How long does shipping take?",
        answer:
          "Shipping times vary depending on the seller's location and the shipping method chosen. Most domestic shipments take 3-7 business days, while international shipping can take 7-21 days. Tracking information is provided when available.",
      },
      {
        id: "shipping-damage",
        question: "What if my item arrives damaged?",
        answer:
          "If your item arrives damaged, contact us immediately with photos of the damage. We'll work with the seller and shipping carrier to resolve the issue, which may include a full refund or replacement.",
      },
      {
        id: "international-shipping",
        question: "Do you ship internationally?",
        answer:
          "Many of our sellers offer international shipping, but it depends on the individual seller's preferences. Check the shipping details on each product listing to see if international delivery is available.",
      },
      {
        id: "tracking",
        question: "Can I track my shipment?",
        answer:
          'Yes! Once your item ships, you\'ll receive tracking information via email. You can also view tracking details in your account dashboard under "My Purchases" or "My Bids" section.',
      },
    ],
    security: [
      {
        id: "account-security",
        question: "How do I keep my account secure?",
        answer:
          "Use a strong, unique password and enable two-factor authentication if available. Never share your login credentials, and always log out when using public computers. Monitor your account regularly for any suspicious activity.",
      },
      {
        id: "data-protection",
        question: "How is my personal data protected?",
        answer:
          "We follow strict data protection protocols and comply with privacy regulations. Your personal information is encrypted and never shared with third parties without your consent. Read our Privacy Policy for complete details.",
      },
      {
        id: "suspicious-activity",
        question: "What should I do if I notice suspicious activity?",
        answer:
          "If you notice any suspicious activity on your account, change your password immediately and contact our support team. We take security seriously and will investigate any reported issues promptly.",
      },
      {
        id: "scam-protection",
        question: "How do you protect against scams?",
        answer:
          "We have multiple security measures including seller verification, secure payment processing, and buyer protection policies. Our team monitors for suspicious listings and user behavior. Always report any suspicious activity to our support team.",
      },
      {
        id: "verified-sellers",
        question: "How do I know if a seller is trustworthy?",
        answer:
          "Look for seller ratings, reviews from previous buyers, and verification badges. Established sellers with positive feedback are generally more trustworthy. You can also check how long they've been active on our platform.",
      },
    ],
    seller: [
      {
        id: "become-seller",
        question: "How do I become a seller on BidBazaar?",
        answer:
          'To become a seller, create an account and select "Vendor" as your account type. You\'ll need to provide some additional information for verification purposes. Once approved, you can start listing items for auction.',
      },
      {
        id: "listing-items",
        question: "How do I list an item for auction?",
        answer:
          'From your seller dashboard, click "Create New Listing" and fill in the item details including title, description, starting price, auction duration, and upload high-quality photos. Our team will review your listing before it goes live.',
      },
      {
        id: "seller-fees",
        question: "What fees do sellers pay?",
        answer:
          "Sellers pay a small commission fee only when an item sells successfully. The fee is a percentage of the final sale price. There are no upfront fees for listing items or maintaining your seller account.",
      },
      {
        id: "pricing-strategy",
        question: "How should I price my items?",
        answer:
          "Research similar items on our platform and other marketplaces to set competitive starting prices. Consider the item's condition, rarity, and market demand. Starting with a lower price often generates more bidding interest.",
      },
      {
        id: "seller-support",
        question: "What support do you provide to sellers?",
        answer:
          "We provide comprehensive seller support including listing optimization tips, market insights, promotional opportunities, and dedicated seller support. Our seller resources section has guides to help you succeed.",
      },
      {
        id: "listing-approval",
        question: "How long does listing approval take?",
        answer:
          "Most listings are approved within 24 hours. Items that require additional verification or don't meet our guidelines may take longer. You'll receive an email notification once your listing is approved or if changes are needed.",
      },
    ],
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      green: "bg-green-100 text-green-600 border-green-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      red: "bg-red-100 text-red-600 border-red-200",
      indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
    };
    return colors[color] || colors.blue;
  };

  const getActiveColor = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-300 text-blue-700",
      green: "bg-green-50 border-green-300 text-green-700",
      purple: "bg-purple-50 border-purple-300 text-purple-700",
      orange: "bg-orange-50 border-orange-300 text-orange-700",
      red: "bg-red-50 border-red-300 text-red-700",
      indigo: "bg-indigo-50 border-indigo-300 text-indigo-700",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about BidBazaar. Can't find what
              you're looking for? Contact our support team for personalized
              assistance.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Categories
              </h3>
              <nav className="space-y-2">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                        isActive
                          ? getActiveColor(category.color)
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {category.name}
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {faqData[category.id]?.length || 0}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  {(() => {
                    const category = faqCategories.find(
                      (cat) => cat.id === activeCategory
                    );
                    const Icon = category?.icon || QuestionMarkCircleIcon;
                    return (
                      <>
                        <div
                          className={`p-2 rounded-lg mr-3 ${getCategoryColor(
                            category?.color || "blue"
                          )}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {category?.name || "General"} Questions
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {faqData[activeCategory]?.length || 0} questions in
                            this category
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {faqData[activeCategory]?.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6"
                  >
                    <button
                      onClick={() => toggleQuestion(faq.id)}
                      className="w-full flex items-center justify-between text-left focus:outline-none group"
                    >
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {faq.question}
                      </h3>
                      <ChevronDownIcon
                        className={`ml-4 h-5 w-5 text-gray-500 transform transition-transform ${
                          openQuestions[faq.id] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {openQuestions[faq.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pr-8">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you 24/7. Get in touch with us
              for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:vivans720@gmail.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Email Support
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 transition-colors"
              >
                Contact Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
