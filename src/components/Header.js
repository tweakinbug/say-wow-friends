"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Container from "./Container";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useChains,
} from "wagmi";
import { Wallet, Network, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, doc, getDoc } from "@/config/firebaseconfig";
import { useRouter } from "next/navigation";

const Header = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const currentChain = chains.find((c) => c.id === chainId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleConnect = async () => {
    if (connectors && connectors.length > 0) {
      try {
        await connect({ connector: connectors[0] });
        if (address) {
          console.log("Connected with address:", address);
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      console.error("No connectors available.");
    }
  };

  const checkUserExists = useCallback(async (walletAddress) => {
    if (!walletAddress) return false; // Add a check for null address

    try {
      const userDocRef = doc(db, "users", walletAddress);
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      checkUserExists(address).then((userExists) => {
        if (userExists) {
          router.push("/pages/dashboard");
        } else {
          router.push(`/signup`);
        }
      });
    }
  }, [isConnected, address, router]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert("Address copied to clipboard");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-transparent fixed top-0 left-0 right-0 md:absolute z-50 mx-auto w-full">
      <Container className="!px-0">
        <nav className="shadow-md md:shadow-none bg-white md:bg-transparent mx-auto flex justify-between items-center py-2 px-5 md:py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="wow Logo" className="w-25 h-12" />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6">
            <li>
              {!isConnected ? (
                // Render ONE "Get Started" button when not connected (Desktop)
                <button
                  onClick={handleConnect}
                  className="text-black bg-primary hover:bg-primary-accent px-8 py-3 rounded-full transition-colors"
                  disabled={isPending}
                >
                  {isPending ? "Connecting..." : "Get Started"}
                </button>
              ) : (
                // Render connected wallet info when connected (Desktop)
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors"
                  >
                    <Wallet size={16} /> {/* Using lucide-react Wallet icon */}
                    <span className="font-medium">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu-button"
                        tabIndex={-1}
                      >
                        <div className="py-1" role="menuitem" tabIndex={-1}>
                          <span className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                            <Network size={16} />
                            Network: {currentChain?.name || "Unknown"}
                          </span>
                          <button
                            onClick={handleCopyAddress}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 w-full justify-start"
                            role="menuitem"
                            tabIndex={-1}
                          >
                            <Wallet size={16} />
                            Address: {address?.slice(0, 6)}...
                            {address?.slice(-4)}
                          </button>
                          <button
                            onClick={disconnect}
                            className="block px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 w-full justify-start"
                            role="menuitem"
                            tabIndex={-1}
                          >
                            <LogOut size={16} />
                            Disconnect
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {!isConnected ? (
              // Render ONE "Get Started" button for mobile when not connected
              <button
                onClick={handleConnect}
                className="text-black bg-primary hover:bg-primary-accent px-8 py-3 rounded-full transition-colors"
                disabled={isPending}
              >
                {isPending ? "Connecting..." : "Get Started"}
              </button>
            ) : (
              // Render connected wallet info for mobile when connected
              <div className="relative" ref={dropdownRef}>
                {" "}
                {/* Add ref for mobile too if needed */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors"
                >
                  <Wallet size={16} /> {/* Using lucide-react Wallet icon */}
                  <span className="font-medium">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu-button"
                      tabIndex={-1}
                    >
                      <div className="py-1" role="menuitem" tabIndex={-1}>
                        <span className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                          <Network size={16} />
                          Network: {currentChain?.name || "Unknown"}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 w-full justify-start"
                          role="menuitem"
                          tabIndex={-1}
                        >
                          <Wallet size={16} />
                          Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </button>
                        <button
                          onClick={disconnect}
                          className="block px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 w-full justify-start"
                          role="menuitem"
                          tabIndex={-1}
                        >
                          <LogOut size={16} />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
};

export default Header;
