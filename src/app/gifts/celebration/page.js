"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Check, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { db, doc, getDoc, updateDoc } from "@/config/firebaseconfig";
import { useSearchParams } from "next/navigation";

export default function CelebrationGiftPage() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get("id");

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false);
  const [giftData, setGiftData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGiftData = async () => {
      if (!giftId) {
        setError("Gift ID is missing from the URL.");
        return;
      }

      try {
        const giftDocRef = doc(db, "gifts", giftId);
        const giftDocSnap = await getDoc(giftDocRef);

        if (giftDocSnap.exists()) {
          setGiftData(giftDocSnap.data());
        } else {
          setError("Gift not found.");
        }
      } catch (e) {
        console.error("Error fetching gift data:", e);
        setError("Failed to load gift data.");
      }
    };

    fetchGiftData();
  }, [giftId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
        <p className="text-red-500 font-bold">{error}</p>{" "}
      </div>
    );
  }

  if (!giftData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
        <p>Loading gift...</p>
      </div>
    );
  }

  const openMessage = () => {
    setIsMessageOpen(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
    });
  };

  const claimGift = async () => {
    setIsClaimingInProgress(true);

    try {
      const giftDocRef = doc(db, "gifts", giftId);
      await updateDoc(giftDocRef, { status: "claimed" });
      setIsClaimed(true);
      setTimeout(() => {
        setIsClaimingInProgress(false);

        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
        });
      }, 2000);
    } catch (e) {
      console.error("Error claiming gift:", e);
      setError("Failed to claim gift. Please try again.");
      setIsClaimingInProgress(false);
    }
  };

  const SparkleEffect = () => {
    useEffect(() => {
      return () => {
        // Cleanup any animations that might be using window
      };
    }, []);

    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      <SparkleEffect />

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2 flex items-center justify-center">
            <span className="mr-2">🎉</span> Celebration!{" "}
            <span className="ml-2">🎉</span>
          </h1>
          <p className="text-gray-600">
            You've received a special crypto gift!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {!isMessageOpen ? (
                <motion.div
                  key="envelope"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="relative w-full max-w-64 h-48 mx-auto mb-6 cursor-pointer"
                    onClick={openMessage}
                  >
                    <motion.div
                      className="absolute inset-0 bg-purple-100 rounded-lg border-2 border-purple-300"
                      animate={{ rotateZ: [0, 2, -2, 0], y: [0, -5, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32"
                            animate={{
                              rotateZ: [0, 10, -10, 0],
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 4,
                            }}
                          >
                            <div className="text-6xl">🎉</div>
                          </motion.div>
                          <div className="mt-16 text-center text-purple-600 font-medium">
                            Tap to open
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openMessage}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium flex items-center"
                  >
                    Open Celebration <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.button>
                </motion.div>
              ) : !isClaimed ? (
                <motion.div
                  key="gift"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
                      <Gift className="h-8 w-8 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 break-words">
                      {`${giftData.senderAddress.slice(
                        0,
                        5
                      )}...${giftData.senderAddress.slice(-5)}`}{" "}
                      sent you a gift!
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {giftData.nftDetails?.name}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                    <p className="text-gray-700 italic">"{giftData.message}"</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={claimGift}
                    disabled={
                      isClaimingInProgress || giftData.status === "claimed"
                    }
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                      isClaimingInProgress
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : giftData.status === "claimed"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {isClaimingInProgress ? (
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
                        Claiming Gift...
                      </>
                    ) : giftData.status === "claimed" ? (
                      <>Gift Claimed</>
                    ) : (
                      <>
                        Claim Celebration Gift{" "}
                        <Sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="claimed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Gift Claimed Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {giftData.nftDetails?.name} has been added to your wallet.
                  </p>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-gray-600">
                      Transaction ID:{" "}
                      <span className="font-mono text-xs break-all">
                        0x5a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
