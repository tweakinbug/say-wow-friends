"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  db,
  collection,
  query,
  orderBy,
  getDocs,
} from "@/config/FirebaseConfig";
import {
  History,
  Loader2,
  AlertCircle,
  Gift,
  Link as LinkIcon,
  Mail,
  CalendarDays,
  Menu,
  X,
  Wallet,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const formatDate = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return "Date unavailable";
};

export default function GiftHistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const disconnect = useDisconnect();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const walletConnected = isConnected;
  const walletAddress = address;

  const connectWallet = async () => {
    if (connectors && connectors.length > 0) {
      try {
        await connect({ connector: connectors[0] });
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      console.error("No connectors available.");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isConnected || !address) {
        setHistoryData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const historyCollectionRef = collection(
          db,
          "userGiftHistory",
          address,
          "history"
        );

        const q = query(historyCollectionRef, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fetchedGifts = [];
          querySnapshot.forEach((doc) => {
            fetchedGifts.push({ id: doc.id, ...doc.data() });
          });
          setHistoryData(fetchedGifts);
        } else {
          console.log("No history documents found for user:", address);
          setHistoryData([]);
        }
      } catch (err) {
        console.error("Error fetching gift history:", err);
        setError("Failed to load gift history. Please try again later.");
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [address, isConnected]);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 p-10 rounded-lg mt-10">
          <Wallet className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">Wallet Not Connected</p>
          <p className="text-sm text-center mb-4">
            Please connect your wallet to view your gift history.
          </p>
          <button
            onClick={connectWallet}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center"
          >
            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
          </button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-purple-600" />
          <p>Loading Gift History...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-red-600 bg-red-50 p-6 rounded-lg border border-red-200 mt-10">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-center font-medium">{error}</p>
        </div>
      );
    }

    if (historyData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 p-10 rounded-lg mt-10">
          <Gift className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No Gifts Sent Yet</p>
          <p className="text-sm">Your sent gift history will appear here.</p>
          <Link
            href="/pages/dashboard"
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            Send Your First Gift
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {historyData.map((item) => (
          <div
            key={item.id || item.giftId}
            className="bg-white rounded-lg shadow p-4 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Gift className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.theme} Gift
                  </p>
                  <p className="text-sm text-gray-600">
                    Summary: {item.giftSummary || "N/A"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-500 sm:text-right mt-2 sm:mt-0">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  {item.recipientInfo?.includes("@") ? (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>To: {item.recipientInfo}</span>
                    </>
                  ) : item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>View Link</span>
                    </a>
                  ) : (
                    <span>Link not available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mr-3 text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img
              src="/images/purple.png"
              alt="wow Logo"
              className="w-15 h-10"
            />
          </div>
        </div>
        {!walletConnected ? (
          <button
            onClick={connectWallet}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center"
          >
            <Wallet className="mr-1 h-3.5 w-3.5" /> Connect
          </button>
        ) : (
          <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
            <span className="text-xs text-gray-700 font-medium">
              {walletAddress
                ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(
                    walletAddress.length - 4
                  )}`
                : ""}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/30"></div>

            <motion.div
              className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-xl flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/purple.png"
                    alt="wow Logo"
                    className="w-15 h-7"
                  />
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="px-2 space-y-1">
                  <Link
                    href="/pages/dashboard"
                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <User className="mr-3 h-5 w-5" /> Dashboard
                  </Link>
                  <Link
                    href="/pages/history"
                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-purple-50 text-purple-700"
                  >
                    <History className="mr-3 h-5 w-5" /> Gift History
                  </Link>
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={disconnect}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-20 md:pt-0">
        <div className="py-6 hidden md:block">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <History className="mr-3 h-6 w-6 text-purple-600" />
            Gift History
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            A record of all the onchain gifts you've sent.
          </p>
        </div>

        {renderContent()}
      </div>
    </>
  );
}
