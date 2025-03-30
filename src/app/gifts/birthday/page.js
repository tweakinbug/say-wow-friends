"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Sparkles,
  Check,
  ArrowRight,
  TwitterIcon,
  Wallet,
  Loader2,
} from "lucide-react"; // Import Wallet & Loader2
import confetti from "canvas-confetti";
import { useSearchParams } from "next/navigation";
import { db, doc, getDoc, updateDoc, app } from "@/config/FirebaseConfig";
import {
  getAuth,
  signInWithPopup,
  TwitterAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { useAccount, useConnect } from "wagmi"; // Import wagmi hooks

export default function BirthdayGiftPage() {
  const searchParams = useSearchParams();
  const giftId = searchParams.get("id");
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnectingWallet } = useConnect();

  // Component State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaimingInProgress, setIsClaimingInProgress] = useState(false);
  const [giftData, setGiftData] = useState(null);
  const [error, setError] = useState(null);
  const [isTwitterVerified, setIsTwitterVerified] = useState(false);
  const [isVerifyingTwitter, setIsVerifyingTwitter] = useState(false);

  const auth = getAuth(app);

  // Fetch Gift Data Effect
  useEffect(() => {
    const fetchGiftData = async () => {
      if (!giftId) {
        setError("Gift ID is missing from the URL.");
        return;
      }
      setError(null); // Clear previous errors
      try {
        const giftDocRef = doc(db, "gifts", giftId);
        const giftDocSnap = await getDoc(giftDocRef);

        if (giftDocSnap.exists()) {
          const data = giftDocSnap.data();
          setGiftData(data);
          if (data.status === "claimed") {
            setIsClaimed(true);
            setIsEnvelopeOpen(true);
            if (data.verificationTwitterHandle) {
              setIsTwitterVerified(true); // Assume verified if already claimed
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
  }, [giftId]);

  // --- Helper Functions ---

  const openEnvelope = () => {
    setIsEnvelopeOpen(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.3 } });
  };

  const verifyTwitter = async () => {
    // ... (verifyTwitter function remains the same)
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

  const claimGift = async () => {
    // Wallet Check FIRST
    if (!isConnected) {
      setError("Please connect your wallet to claim the gift.");
      return;
    }
    // Verification Check
    if (giftData?.verificationTwitterHandle && !isTwitterVerified) {
      setError("Please verify your Twitter account before claiming.");
      return;
    }
    // Claimed Check
    if (isClaimed || giftData?.status === "claimed") {
      setError("This gift has already been claimed.");
      return;
    }

    setIsClaimingInProgress(true);
    setError(null);
    try {
      const giftDocRef = doc(db, "gifts", giftId);
      await updateDoc(giftDocRef, { status: "claimed", claimedBy: address }); // Optionally store claiming address
      setIsClaimed(true);
      setGiftData((prevData) => ({ ...prevData, status: "claimed" }));
      setTimeout(() => {
        setIsClaimingInProgress(false);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }, 1500);
    } catch (e) {
      console.error("Error claiming gift:", e);
      setError("Failed to claim gift. Please try again.");
      setIsClaimingInProgress(false);
    }
  };

  const SparkleEffect = () => {
    // ... (SparkleEffect remains the same)
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
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

  // Error Display Component
  const ErrorDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col items-center justify-center p-4 relative">
      <p className="text-red-600 font-bold text-center bg-red-100 p-4 rounded-lg shadow-md">
        {error}
      </p>
    </div>
  );

  // Loading Display Component
  const LoadingDisplay = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col items-center justify-center p-4 relative">
      <Loader2 className="h-8 w-8 text-pink-500 animate-spin mb-2" />
      <p className="text-gray-600">Loading gift...</p>
    </div>
  );

  // Show error first
  if (error) return <ErrorDisplay />;
  // Show loading if no data yet
  if (!giftData) return <LoadingDisplay />;

  // Determine which action button to show
  const renderActionButton = () => {
    // 1. Twitter Verification Needed?
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
            .filter((connector) => connector.name === "MetaMask")
            .map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isConnectingWallet}
                className={`w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white font-medium shadow-md transform hover:scale-105 flex items-center justify-center text-sm sm:text-base ${
                  isConnectingWallet ? "opacity-70 cursor-not-allowed" : ""
                }`}
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
            : "bg-pink-600 hover:bg-pink-700 text-white"
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
            Claim Your Gift <Sparkles className="ml-2 h-4 w-4" />{" "}
          </>
        )}
      </motion.button>
    );
  };

  // Main Component Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SparkleEffect />
      <div className="max-w-md w-full mx-auto z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2 flex items-center justify-center">
            <span className="mr-2">🎂</span> Happy {giftData.theme || "Gift"}!
            <span className="ml-2">🎂</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            You've received a special crypto gift!
          </p>
          {/* Show connected wallet address briefly */}
          {isConnected && (
            <p className="text-xs text-purple-600 mt-1 font-mono">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {/* Envelope View */}
              {!isEnvelopeOpen ? (
                <motion.div
                  key="envelope" /* ... envelope content ... */
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="relative w-48 h-36 sm:w-64 sm:h-48 mx-auto mb-4 sm:mb-6 cursor-pointer group"
                    onClick={openEnvelope}
                  >
                    <motion.div
                      className="absolute inset-0 bg-pink-500 rounded-lg transition-transform duration-300 group-hover:scale-105"
                      animate={{ rotateY: [0, 15, 0], y: [0, -5, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                      }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-6 sm:h-8 bg-pink-600 rounded-b-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Gift className="text-white h-12 w-12 sm:h-16 sm:w-16" />
                      </div>
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openEnvelope}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium flex items-center text-sm sm:text-base transition-colors"
                  >
                    Open Your Gift <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.button>
                </motion.div>
              ) : /* Gift/Claim/Verify View */
              !isClaimed ? (
                <motion.div
                  key="gift" /* ... gift/verify/claim content ... */
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Gift Info */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-block p-3 bg-pink-100 rounded-full mb-3 sm:mb-4">
                      <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
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
                        : "A Special Gift"}
                    </p>
                  </div>
                  {/* Message */}
                  <div className="bg-pink-50 p-3 sm:p-4 rounded-lg border border-pink-100 mb-4 sm:mb-6">
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
                      : "Your gift is being processed."}
                  </p>
                  <p className="text-xs text-gray-500">
                    (Check wallet{" "}
                    <span className="font-mono">
                      {address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : ""}
                    </span>{" "}
                    shortly)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Error display area below card */}
        {error &&
          !giftId && ( // Show specific error if gift ID is missing *here*
            <p className="text-red-600 font-semibold mt-4 text-center bg-red-100 p-3 rounded-lg shadow">
              {error}
            </p>
          )}
        {error &&
          giftId && ( // Show other errors if gift ID was present
            <p className="text-red-600 font-semibold mt-4 text-center bg-red-100 p-3 rounded-lg shadow">
              {error}
            </p>
          )}
      </div>
    </div>
  );
}
