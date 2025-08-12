import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Online Auction Site</h3>
            <p className="text-secondary-300 text-sm">
              A platform connecting artisans and buyers through online auctions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-secondary-300 hover:text-white text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-secondary-300 hover:text-white text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-secondary-300 hover:text-white text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-secondary-300 hover:text-white text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="text-secondary-300 text-sm not-italic">
              <p>Email: bidbazaar00@gmail.com</p>
              <p>Phone: +91 7982XXXXXX</p>
            </address>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-secondary-700 text-center text-secondary-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} BidBazaar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
