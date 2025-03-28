"use client";

import { Gift, History, LogOut, User, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar({
  walletConnected,
  walletAddress,
  connectWallet,
  disconnectWallet,
}) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src="/images/purple.png"
              alt="wow Logo"
              className="w-15 h-10"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-4 space-y-1">
            <a
              href="/pages/dashboard"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                pathname === "/pages/dashboard"
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="mr-3 h-5 w-5" />
              Dashboard
            </a>
            <a
              href="/pages/history"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                pathname === "/pages/history"
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <History className="mr-3 h-5 w-5" />
              Gift History
            </a>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={disconnectWallet}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
        {!walletConnected && (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center w-full justify-center" // w-full and justify-center added for button width
            >
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </button>
          </div>
        )}
        {walletConnected && (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full justify-center">
              {" "}
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700 font-medium">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
