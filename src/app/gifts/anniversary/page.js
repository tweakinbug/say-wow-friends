"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Check, ArrowRight, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { db, doc, getDoc, updateDoc } from "@/config/Firebaseconfig";
import { useSearchParams } from "next/navigation";

export default function AnniversaryGiftPage() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get("id");
  console.log("Gift ID:", giftId);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false);
  const [giftData, setGiftData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGiftData = async () => {
      if (!giftId) {
        setError("Invalid link. Please try again.");
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex flex-col items-center justify-center p-4 relative">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  if (!giftData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex flex-col items-center justify-center p-4 relative">
        <p>Loading gift...</p>
      </div>
    );
  }

  const openEnvelope = () => {
    setIsEnvelopeOpen(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ["#ff758f", "#ff8fa3", "#ffb3c1"],
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
          colors: ["#ff758f", "#ff8fa3", "#ffb3c1"], // Pink/red colors for anniversary
        });
      }, 2000);
    } catch (e) {
      console.error("Error claiming gift:", e);
      setError("Failed to claim gift. Please try again.");
      setIsClaimingInProgress(false);
    }
  };

  const HeartEffect = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-400"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [null, Math.random() * -200 - 100],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 4 + Math.random() * 3,
              delay: Math.random() * 5,
            }}
          >
            <Heart size={Math.random() * 10 + 10} fill="currentColor" />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex flex-col items-center justify-center p-4 relative">
      <HeartEffect />

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500 mb-2 flex items-center justify-center">
            <span className="mr-2">💖</span> Happy Anniversary!{" "}
            <span className="ml-2">💖</span>
          </h1>
          <p className="text-gray-600">
            You've received a special anniversary gift!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-pink-500 to-red-400"></div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {!isEnvelopeOpen ? (
                <motion.div
                  key="envelope"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="relative w-64 h-48 mx-auto mb-6 cursor-pointer"
                    onClick={openEnvelope}
                  >
                    <motion.div
                      className="absolute inset-0 bg-red-400 rounded-lg"
                      animate={{ rotateY: [0, 15, 0], y: [0, -5, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                      }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-red-500 rounded-b-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="text-white h-16 w-16" fill="white" />
                      </div>
                    </motion.div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openEnvelope}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium flex items-center"
                  >
                    Open Anniversary Gift{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
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
                    <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
                      <Gift className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {`${giftData.senderAddress.slice(
                        0,
                        5
                      )}...${giftData.senderAddress.slice(-5)}`}{" "}
                      sent you an anniversary gift!
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {giftData.tokenDetails?.amount}{" "}
                      {giftData.tokenDetails?.name}
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
                    <p className="text-gray-700 italic">"{giftData.message}"</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={claimGift}
                    disabled={
                      isClaimingInProgress || giftData.status === "claimed"
                    } // Disable if claiming or already claimed
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                      isClaimingInProgress
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : giftData.status === "claimed"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
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
                        Claim Anniversary Gift{" "}
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
                    Anniversary Gift Claimed Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {giftData.tokenDetails?.amount}{" "}
                    {giftData.tokenDetails?.name} has been added to your wallet.
                  </p>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-gray-600">
                      Transaction ID:{" "}
                      <span className="font-mono text-xs">
                        0x71C7656EC7ab88b098defB751B7401B5f6d8976F
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
