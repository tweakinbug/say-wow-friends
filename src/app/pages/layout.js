"use client";

import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function PagesLayout({ children }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    if (connectors && connectors.length > 0) {
      try {
        await connect({ connector: connectors[0] });
        if (address) {
          console.log("Connected with address:", address);
          setWalletConnected(true);
          setWalletAddress(address);
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      console.error("No connectors available.");
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      setWalletConnected(true);
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-violet-50 to-rose-50">
      {" "}
      <Sidebar
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        connectWallet={connectWallet}
        disconnectWallet={disconnect}
      />
      <div className="md:pl-64 flex flex-col flex-1">
        {" "}
        <div className="hidden md:flex sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-800">
                Dashboard Area
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto pb-8 pt-4 md:pt-6">
          {" "}
          {children}
        </main>
      </div>
    </div>
  );
}
