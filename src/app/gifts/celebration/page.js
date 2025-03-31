"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Sparkles,
  Check,
  ArrowRight,
  Wallet,
  Loader2,
  TwitterIcon,
} from "lucide-react";
import confetti from "canvas-confetti";
import { db, doc, getDoc, updateDoc, app } from "@/config/FirebaseConfig";
import { useSearchParams } from "next/navigation";
import {
  getAuth,
  signInWithPopup,
  TwitterAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { useAccount, useConnect } from "wagmi";

// Create a separate component for using useSearchParams
function GiftContent() {
  // Wagmi Hooks
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnectingWallet } = useConnect();
  const searchParams = useSearchParams();
  // Component State
  const [isMessageOpen, setIsMessageOpen] = useState(false); // Renamed from isEnvelopeOpen
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false);
  const [giftData, setGiftData] = useState(null);
  const [error, setError] = useState(null);
  const [isTwitterVerified, setIsTwitterVerified] = useState(false); // Added
  const [isVerifyingTwitter, setIsVerifyingTwitter] = useState(false); // Added
  const explorer = "https://explorer.sepolia.linea.build/";
  const auth = getAuth(app); // Added

  useEffect(() => {
    const fetchGiftData = async () => {
      const giftId = searchParams.get("id");
      if (!giftId) {
        setError("Gift ID is missing from the URL.");
        return;
      }
      setError(null);
      try {
        const giftDocRef = doc(db, "gifts", giftId);
        const giftDocSnap = await getDoc(giftDocRef);

        if (giftDocSnap.exists()) {
          const data = giftDocSnap.data();
          setGiftData(data);
          if (data.status === "claimed") {
            setIsClaimed(true);
            setIsMessageOpen(true); // Open message if already claimed
            if (data.verificationTwitterHandle) {
              setIsTwitterVerified(true);
            }
          }
        } else {
          setError("Gift not found.");
        }
      } catch (e) {
        console.error("Error fetching gift data:", e);
        setError("Failed to load gift data.");
      }
    };
    fetchGiftData();
  }, []);

  // --- Helper Functions ---

  const openMessage = () => {
    setIsMessageOpen(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      // Use default confetti colors or theme-specific if desired
    });
  };

  const verifyTwitter = async () => {
    if (!giftData || !giftData.verificationTwitterHandle) {
      setError("Gift data or verification handle missing.");
      setIsVerifyingTwitter(false);
      return;
    }
    setIsVerifyingTwitter(true);
    setError(null);
    const provider = new TwitterAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      if (!additionalInfo?.username) {
        throw new Error("Could not retrieve Twitter screen name.");
      }
      const twitterHandle = additionalInfo.username;
      const giftHandleNormalized = giftData.verificationTwitterHandle
        .replace("@", "")
        .toLowerCase();
      const userHandleNormalized = twitterHandle.toLowerCase();
      if (giftHandleNormalized === userHandleNormalized) {
        setIsTwitterVerified(true);
        console.log("Twitter verification successful!");
      } else {
        setError(
          `Twitter handle verification failed. Required: @${giftHandleNormalized}, Signed in as: @${userHandleNormalized}`
        );
        setIsTwitterVerified(false);
      }
    } catch (error) {
      setError(`Twitter verification error: ${error.code} - ${error.message}`);
      console.error("Twitter verification error:", error);
      setIsTwitterVerified(false);
    } finally {
      setIsVerifyingTwitter(false);
    }
  };

  const [xash, setXash] = useState("");

  const claimGift = async () => {
    if (!isConnected) {
      setError("Please connect your wallet to claim the gift.");
      return;
    }
    if (giftData?.verificationTwitterHandle && !isTwitterVerified) {
      setError("Please verify your Twitter account before claiming.");
      return;
    }
    if (isClaimed || giftData?.status === "claimed") {
      setError("This gift has already been claimed.");
      return;
    }
    let amount = giftData.tokenDetails.amount;
    setIsClaimingInProgress(true);
    setError(null);
    try {

      if(!process.env.NEXT_PUBLIC_API_II){
        console.warn("error admin end");
        return;
       }
       const ee = await fetch(process.env.NEXT_PUBLIC_API_II, {
         method: 'POST',
         headers: {
          'Content-Type': 'application/json'
         },
         body: JSON.stringify({ address, amount })
     });
   
     const res = await ee.json();
     if (res.success) {
      setXash(res.hash);
      const giftId = searchParams.get("id");
      const giftDocRef = doc(db, "gifts", giftId);
      await updateDoc(giftDocRef, { status: "claimed", claimedBy: address });
      setIsClaimed(true);
      setGiftData((prevData) => ({ ...prevData, status: "claimed" }));
      setTimeout(() => {
        setIsClaimingInProgress(false);
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          // Use default confetti colors or theme-specific if desired
        });
      }, 1500);
    } else {
      throw new Error(res);
    }
    } catch (e) {
      console.error("Error claiming gift:", e);
      setError("Failed to claim gift. Please try again.");
      setIsClaimingInProgress(false);
    }
  };

  const SparkleEffect = () => {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              // Use style for better cross-browser compatibility
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }} // Slightly bigger sparkle
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

  // --- Render Logic ---

  const ErrorDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      <p className="text-red-600 font-bold text-center bg-red-100 p-4 rounded-lg shadow-md">
        {error}
      </p>
    </div>
  );

  const LoadingDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
      <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-2" />
      <p className="text-gray-600">Loading gift...</p>
    </div>
  );

  const renderActionButton = () => {
    if (giftData.verificationTwitterHandle && !isTwitterVerified) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={verifyTwitter}
          disabled={isVerifyingTwitter}
          className={`w-full py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center text-sm sm:text-base transition-colors ${
            isVerifyingTwitter
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isVerifyingTwitter ? (
            <>
              {" "}
              <Loader2 className="animate-spin h-4 w-4 mr-2" /> Verifying
              Twitter...{" "}
            </>
          ) : (
            <>
              {" "}
              <TwitterIcon className="mr-2 h-4 w-4" /> Verify with Twitter{" "}
            </>
          )}
        </motion.button>
      );
    }

    if (!isConnected) {
      return (
        <div className="space-y-2">
          {connectors
            .filter((connector) => connector.name === "MetaMask") // Keep filter or remove as needed
            .map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isConnectingWallet}
                className={`w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white font-medium shadow-md transform hover:scale-105 flex items-center justify-center text-sm sm:text-base ${
                  isConnectingWallet ? "opacity-70 cursor-not-allowed" : ""
                }`} // Celebration color
              >
                {isConnectingWallet ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    <span className="animate-pulse">Connecting...</span>
                  </>
                ) : (
                  <span className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect {connector.name}
                  </span>
                )}
              </button>
            ))}
        </div>
      );
    }

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={claimGift}
        disabled={isClaimingInProgress}
        className={`w-full py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center text-sm sm:text-base mt-2 transition-colors ${
          isClaimingInProgress
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white" // Celebration color
        }`}
      >
        {isClaimingInProgress ? (
          <>
            {" "}
            <Loader2 className="animate-spin h-4 w-4 mr-2" /> Claiming Gift...{" "}
          </>
        ) : (
          <>
            {" "}
            Claim Celebration Gift <Sparkles className="ml-2 h-4 w-4" />{" "}
          </>
        )}
      </motion.button>
    );
  };

  if (error) return <ErrorDisplay />;
  if (!giftData) return <LoadingDisplay />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SparkleEffect />
      <div className="max-w-md w-full mx-auto z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2 flex items-center justify-center">
            {" "}
            {/* Celebration color */}
            <span className="mr-2">🎉</span> Celebration!{" "}
            <span className="ml-2">🎉</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            You've received a special crypto gift!
          </p>
          {isConnected && (
            <p className="text-xs text-purple-600 mt-1 font-mono">
              {" "}
              {/* Celebration color */}
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {!isMessageOpen ? (
                <motion.div
                  key="envelope" // Using 'envelope' key for consistency, though UI is different
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="relative w-full max-w-64 h-48 mx-auto mb-6 cursor-pointer group"
                    onClick={openMessage}
                  >
                    <motion.div
                      className="absolute inset-0 bg-purple-100 rounded-lg border-2 border-purple-300 transition-transform duration-300 group-hover:scale-105"
                      animate={{ rotateZ: [0, 1.5, -1.5, 0], y: [0, -4, 0] }} // Subtle animation
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3.5, // Slightly different timing
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative text-center">
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl"
                            animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2.5,
                              delay: 0.5,
                            }}
                          >
                            🎉
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
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium flex items-center text-sm sm:text-base transition-colors" // Celebration color
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
                  {/* Gift Info */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-block p-3 bg-purple-100 rounded-full mb-3 sm:mb-4">
                      {" "}
                      {/* Celebration color */}
                      <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />{" "}
                      {/* Celebration color */}
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
                      {`${giftData.senderAddress.slice(
                        0,
                        5
                      )}...${giftData.senderAddress.slice(-5)}`}{" "}
                      sent you a gift!
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      {giftData.tokenDetails?.amount &&
                      giftData.tokenDetails?.name
                        ? `${giftData.tokenDetails.amount} ${giftData.tokenDetails.name}`
                        : giftData.nftDetails?.name
                        ? `NFT: ${giftData.nftDetails.name}`
                        : "A Special Celebration Gift"}
                    </p>
                  </div>
                  {/* Message */}
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100 mb-4 sm:mb-6">
                    {" "}
                    {/* Celebration color */}
                    <p className="text-gray-700 italic text-sm sm:text-base">
                      "{giftData.message}"
                    </p>
                  </div>
                  {/* Action Button Area */}
                  <div className="mt-4">{renderActionButton()}</div>
                </motion.div>
              ) : (
                <motion.div
                  key="claimed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-block p-3 bg-green-100 rounded-full mb-3 sm:mb-4">
                    <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    Gift Claimed Successfully!
                  </h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    {giftData.tokenDetails?.amount &&
                    giftData.tokenDetails?.name
                      ? `${giftData.tokenDetails.amount} ${giftData.tokenDetails.name} is being processed.`
                      : giftData.nftDetails?.name
                      ? `NFT ${giftData.nftDetails.name} is being processed.`
                      : "Your celebration gift is being processed."}
                  </p>
                  <a href={`${explorer}tx/${xash}`} className="text-xs underline text-blue-600">
                    view tx
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Error display area below card */}
        {error && (
          <p className="text-red-600 font-semibold mt-4 text-center bg-red-100 p-3 rounded-lg shadow">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CelebrationGiftPage() {
  return (
    <Suspense fallback={<LoadingDisplay />}>
      <GiftContent />
    </Suspense>
  );
}

const LoadingDisplay = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative">
    <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-2" />
    <p className="text-gray-600">Loading gift...</p>
  </div>
);
