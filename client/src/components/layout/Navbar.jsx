import React, { useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../notifications/NotificationDropdown";
import logo from "../../assets/logo.png";

// Navigation items configuration
const getNavigation = (isAuthenticated, userRole) => [
  { name: "Home", href: "/", public: true },
  { name: "About", href: "/about", public: true, hideForAdmin: true },
  { name: "Contact", href: "/contact", public: true, hideForAdmin: true },
  { name: "FAQ", href: "/faq", public: true, hideForAdmin: true },
  {
    name: "Auctions",
    href: "/products",
    public: false,
    hideForAdmin: true,
    hideForVendor: true,
  },
  { name: "Wallet", href: "/wallet", public: false, hideForAdmin: true },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  const { state, logout } = useAuth();
  const { isAuthenticated, user } = state;
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor";

  // Get navigation items based on authentication status and user role
  const navigationItems = getNavigation(isAuthenticated, user?.role);

  const filteredNavigation = navigationItems.filter(
    (item) =>
      (item.public || isAuthenticated) &&
      !(isAdmin && item.hideForAdmin) &&
      !(isVendor && item.hideForVendor)
  );

  // Home URL is always "/" for all users
  const homeUrl = "/";

  // Check if the path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <Disclosure
      as="nav"
      className="bg-gradient-to-r from-primary-600 to-primary-700 shadow sticky top-0 z-50"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-primary-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to={homeUrl} className="flex items-center">
                    <img
                      src={logo}
                      alt="BidBazaar Logo"
                      className="h-8 w-auto mr-2"
                    />
                    <span className="text-white font-bold text-xl">
                      BidBazaar
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:block">
                  <div className="flex space-x-2">
                    {filteredNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          isActivePath(item.href)
                            ? "bg-white text-primary-700 font-medium"
                            : "text-white hover:bg-primary-500 hover:text-white",
                          "px-3 py-2 rounded-md text-sm transition-colors duration-150 flex items-center"
                        )}
                      >
                        {item.name}
                        {isActivePath(item.href) && (
                          <span className="ml-2 w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isAuthenticated ? (
                  <>
                    {/* Notification dropdown */}
                    <NotificationDropdown />

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-primary-500 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600">
                          <span className="sr-only">Open user menu</span>
                          {user?.profileImage ? (
                            <img
                              className="h-8 w-8 rounded-full object-cover border-2 border-white"
                              src={user.profileImage}
                              alt={`${user.name}'s profile`}
                              onError={(e) => {
                                console.error(
                                  "Navbar profile image load error:",
                                  user.profileImage
                                );
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150?text=User";
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary-700 text-sm font-medium">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          {!isAdmin && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/wallet"
                                  className={classNames(
                                    active ? "bg-gray-50" : "",
                                    "flex items-center gap-2 px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                  </svg>
                                  My Wallet
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                          <div className="border-t border-gray-100"></div>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600"
                                )}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                  />
                                </svg>
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="bg-primary-500 border border-primary-400 text-white hover:bg-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 shadow-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-150 shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden border-t border-primary-500 bg-primary-600">
            <div className="space-y-1 px-3 pt-2 pb-3">
              {filteredNavigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    isActivePath(item.href)
                      ? "bg-white text-primary-700 font-medium"
                      : "text-white hover:bg-primary-500",
                    "block px-3 py-2 rounded-md text-base"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
