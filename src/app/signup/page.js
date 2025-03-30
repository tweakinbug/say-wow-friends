"use client";
import { React, useEffect } from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Mail,
  User,
  Calendar,
  Twitter,
  ArrowRight,
  CheckCircle,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { db, doc, setDoc } from "@/config/FirebaseConfig";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [twitter, setTwitter] = useState("");
  const { address } = useAccount();

  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [birthdayError, setBirthdayError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const confettiRef = useRef(null);

  const router = useRouter();

  const [renderSparkles, setRenderSparkles] = useState(false);

  useEffect(() => {
    setRenderSparkles(true);
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!re.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validateUsername = (username) => {
    if (!username) {
      setUsernameError("Username is required");
      return false;
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  const validateBirthday = (birthday) => {
    if (!birthday) {
      setBirthdayError("Birthday is required");
      return false;
    } else {
      const today = new Date();
      const birthdayDate = new Date(birthday);
      if (birthdayDate > today) {
        setBirthdayError("Birthday cannot be in the future");
        return false;
      } else {
        setBirthdayError("");
        return true;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError("");
    const walletAddress = address;
    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(username);
    const isBirthdayValid = validateBirthday(birthday);
    const isWalletAddressValid = !!walletAddress;

    if (
      isEmailValid &&
      isUsernameValid &&
      isBirthdayValid &&
      isWalletAddressValid
    ) {
      setIsSubmitting(true);

      try {
        const nonce =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        const messageToSign = `Sign in to Your Crypto Gifts App.\n\nWallet address: ${walletAddress}\nNonce: ${nonce}`;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(walletAddress);

        let signature;
        try {
          signature = await signer.signMessage(messageToSign);
        } catch (signError) {
          console.error("Signature request rejected or failed:", signError);
          setIsSubmitting(false);
          setSubmissionError(
            "Signature request failed. Please try again and ensure MetaMask is connected and you approve the signature request."
          );
          return;
        }

        try {
          const verifiedAddress = ethers.verifyMessage(
            messageToSign,
            signature
          );
          if (verifiedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            console.error("Signature verification failed: Address mismatch.");
            setIsSubmitting(false);
            setSubmissionError(
              "Signature verification failed. Please try again."
            );
            return;
          }
          console.log(
            "Signature Verified! User authenticated for address:",
            verifiedAddress
          );

          const userDocRef = doc(db, "users", walletAddress);
          await setDoc(userDocRef, {
            email: email,
            username: username,
            birthday: birthday,
            twitter: twitter,
            createdAt: new Date(),
          });

          setIsSubmitting(false);
          setIsSubmitted(true);

          if (confettiRef.current) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        } catch (verificationError) {
          console.error("Signature verification error:", verificationError);
          setIsSubmitting(false);
          setSubmissionError(
            "Signature verification failed. Please try again."
          );
        }
      } catch (error) {
        console.error("Firebase signup error:", error);
        setIsSubmitting(false);
        setSubmissionError("Failed to create account. Please try again.");
      }
    }
  };

  const SparkleEffect = () => {
    return renderSparkles ? (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
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
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 relative">
      <SparkleEffect />
      <div
        ref={confettiRef}
        className="absolute inset-0 pointer-events-none"
      ></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, 0] }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      duration: 1,
                    }}
                    className="inline-block mb-2"
                  >
                    <PartyPopper className="h-12 w-12 text-purple-500" />
                  </motion.div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Join the Celebration!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Sign up to start sending crypto gifts
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => validateEmail(email)}
                        className={`w-full pl-10 pr-3 py-2 border ${
                          emailError ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1 text-sm text-red-500">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => validateUsername(username)}
                        className={`w-full pl-10 pr-3 py-2 border ${
                          usernameError ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        placeholder="cooluser123"
                      />
                    </div>
                    {usernameError && (
                      <p className="mt-1 text-sm text-red-500">
                        {usernameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birthday
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        onBlur={() => validateBirthday(birthday)}
                        className={`w-full pl-10 pr-3 py-2 border ${
                          birthdayError ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      />
                    </div>
                    {birthdayError && (
                      <p className="mt-1 text-sm text-red-500">
                        {birthdayError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter Handle{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Twitter className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  {submissionError && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {submissionError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                      isSubmitting
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className="inline-block mb-4"
                >
                  <div className="relative">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 2,
                        delay: 0.5,
                      }}
                      className="absolute inset-0"
                    ></motion.div>
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome Aboard!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your account has been created successfully.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium"
                  onClick={
                    //do better
                    () => router.push("pages/dashboard")
                  }
                >
                  Get Started
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <a href="#" className="text-purple-600 hover:text-purple-800">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-purple-600 hover:text-purple-800">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
