import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  UserGroupIcon,
  TrophyIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  LightBulbIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const AboutPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const stats = [
    { label: "Active Users", value: "10,000+", icon: UserGroupIcon },
    { label: "Successful Auctions", value: "25,000+", icon: TrophyIcon },
    {
      label: "Total Value Traded",
      value: "₹50 Crores+",
      icon: CurrencyRupeeIcon,
    },
    { label: "Trust Rating", value: "4.8/5", icon: ShieldCheckIcon },
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Secure Transactions",
      description:
        "Advanced security measures and encrypted payment processing ensure your transactions are safe and secure.",
    },
    {
      icon: CheckCircleIcon,
      title: "Verified Sellers",
      description:
        "All sellers undergo verification process to ensure authenticity and build trust in our marketplace.",
    },
    {
      icon: CurrencyRupeeIcon,
      title: "Transparent Pricing",
      description:
        "No hidden fees or charges. Clear, upfront pricing with competitive commission rates.",
    },
    {
      icon: UserGroupIcon,
      title: "Community Driven",
      description:
        "Built by the community, for the community. Your feedback shapes our platform evolution.",
    },
  ];

  const teamMembers = [
    {
      name: "Vivan Sharma",
      image: "/api/placeholder/150/150",
    },
    {
      name: "Lakshay Sharma",
      image: "/api/placeholder/150/150",
    },
    {
      name: "Dherya Jain",
      image: "/api/placeholder/150/150",
    },
    {
      name: "Aman Gupta",
      image: "/api/placeholder/150/150",
    },
    {
      name: "Aman Kumar Mishra",
      image: "/api/placeholder/150/150",
    },
  ];

  const values = [
    {
      icon: HeartIcon,
      title: "Trust & Transparency",
      description:
        "We believe in building long-term relationships through honest communication and transparent processes.",
    },
    {
      icon: LightBulbIcon,
      title: "Innovation",
      description:
        "Continuously improving our platform with cutting-edge technology and user-centric features.",
    },
    {
      icon: GlobeAltIcon,
      title: "Accessibility",
      description:
        "Making online auctions accessible to everyone, regardless of their technical expertise or location.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Security",
      description:
        "Your security is our priority. We employ industry-leading measures to protect your data and transactions.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              {...fadeInUp}
            >
              About BidBazaar
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              India's most trusted online auction platform, connecting buyers
              and sellers in a secure, transparent, and user-friendly
              marketplace.
            </motion.p>
            <motion.div
              className="flex justify-center space-x-4"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">2024</div>
                <div className="text-primary-200">Founded</div>
              </div>
              <div className="border-l border-primary-400 mx-8"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">6+</div>
                <div className="text-primary-200">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-white"
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  BidBazaar was born from a simple idea: to create a platform
                  where anyone could participate in online auctions with
                  complete confidence and transparency. Founded in 2024 by a
                  team of e-commerce veterans, we set out to revolutionize the
                  online auction experience in India.
                </p>
                <p>
                  What started as a small startup has grown into India's leading
                  auction platform, serving thousands of users across the
                  country. Our commitment to security, transparency, and user
                  experience has made us the go-to choice for both seasoned
                  auction participants and newcomers alike.
                </p>
                <p>
                  Today, BidBazaar facilitates millions of rupees in
                  transactions monthly, connecting buyers with unique products
                  and helping sellers reach a wider audience than ever before.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  To democratize online auctions by providing a secure,
                  transparent, and accessible platform that empowers individuals
                  and businesses to trade with confidence.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Our Vision
                </h3>
                <p className="text-gray-600 text-lg">
                  To become the most trusted and innovative auction platform in
                  India, setting new standards for online marketplace
                  excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 bg-white"
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BidBazaar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built our platform with your needs in mind, ensuring every
              auction is fair, secure, and enjoyable.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
                variants={fadeInUp}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="py-20 bg-white"
        variants={staggerChildren}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind BidBazaar's success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <div className="mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name
                      )}&size=128&background=3B82F6&color=ffffff`;
                    }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {member.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Auction Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust BidBazaar for their
            auction needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-700 transition-colors"
            >
              Browse Auctions
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutPage;
