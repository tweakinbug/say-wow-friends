"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Gift,
  Send,
  Wallet,
  Coins,
  ImageIcon,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Mail,
  LinkIcon,
  X,
  TwitterIcon,
  Menu,
  History,
  LogOut,
  User,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uid } from "uid";
import { parseUnits, parseAbi, parseGwei } from "viem";
import { db, doc, setDoc, serverTimestamp } from "@/config/FirebaseConfig";

const tokenOptions = [
  {
    name: "USDC",
    image: "/images/usdc.svg",
    address: "0x1234...5678",
  },
  {
    name: "ETH",
    image: "/images/eth.svg",
    address: "0x8765...4321",
  },
  {
    name: "USDT",
    image: "/images/usdt.svg",
    address: "0x2468...1357",
  },
  {
    name: "PEPE",
    image: "/images/pepe.svg",
    address: "0x1357...2468",
  },
  {
    name: "Brett",
    image: "/images/brett.svg",
    address: "0x1357...2468",
  },
];

// NFT options for the dropdown
const nftOptions = [
  {
    name: "CryptoPunk #1234",
    image: "/images/punk.png",
    address: "0x9876...5432",
  },
  {
    name: "Bored Ape #5678",
    image: "/images/ape.svg",
    address: "0x5432...9876",
  },
  {
    name: "Doodle #9012",
    image: "/images/doodle.jpg",
    address: "0x3456...7890",
  },
];

const themeOptions = [
  { name: "Birthday", image: "/images/candles.svg" },
  { name: "Anniversary", image: "/images/ann.svg" },
  { name: "Celebration", image: "/images/festive.svg" },
  { name: "Holiday", image: "/images/holiday.svg" },
];

const WOW_CONTRACT_ADDRESS = "0xE2ba9ba6EF11e1e046a337000Da77b0013d9A6F8";
const MOCK_USDC_CONTRACT_ADDRESS = "0x072BA244Cf0DE5984dEB40030Aef86d7661303dC";
const wow_abi = [
  "function UserDeposit(uint256 _amount) external returns(bool)",
];

const mock_usdc = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const WOW_CONTRACT_PARSE_ABI = parseAbi(wow_abi);
const MOCK_USDC_CONTRACT_PARSE_ABI = parseAbi(mock_usdc);

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [giftType, setGiftType] = useState("token");
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0]);
  const [selectedNFT, setSelectedNFT] = useState(nftOptions[0]);
  const [amount, setAmount] = useState("0.01");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [nftDropdownOpen, setNftDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("link");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themeOptions[0]);
  const [currentStep, setCurrentStep] = useState(1);
  const confettiRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { disconnect } = useDisconnect();
  const [giftIdForLink, setGiftIdForLink] = useState(null);
  const [verificationTwitterHandle, setVerificationTwitterHandle] =
    useState("");
  const explorer = "https://explorer.sepolia.linea.build/";
  const {
    writeContract: approveContract,
    isSuccess: approveSuccess,
    isError: approveError,
    error: approveWriteError,
    reset: resetApprove,
    //@ts-ignore
    isLoading: approveLoading,
  } = useWriteContract();

  const {
    writeContract: depositContract,
    isSuccess: depositSuccess,
    isError: depositError,
    error: depositWriteError,
    reset: resetDeposit,
    //@ts-ignore
    isLoading: depositLoading,
    data: depositData,
  } = useWriteContract();

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

  const generateAIMessage = async () => {
    const genAI = new GoogleGenerativeAI(
      //@ts-ignore
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    const prompt = `Write a short, friendly, and celebratory message (around 20-40 words) for someone receiving a crypto gift for a ${selectedTheme.name}, ${selectedToken} occasion. Make it sound personal and warm. Do not include placeholders like [Recipient Name] or [Sender Name]. Just provide the message text itself.`;
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    setGeneratedMessage(result.response.text());
    setMessage(result.response.text());
  };

  //@ts-ignore
  const saveGiftDetails = async (giftId, generatedLinkUrl) => {
    if (!walletAddress) {
      console.error("Wallet address is missing, cannot save gift.");
      throw new Error("Wallet not connected.");
    }

    const giftData = {
      giftId: giftId,
      senderAddress: walletAddress,
      giftType: giftType,
      message: message,
      theme: selectedTheme.name,
      deliveryMethod: deliveryMethod,
      recipientEmail: deliveryMethod === "email" ? recipientEmail : null,
      generatedLink: generatedLinkUrl,
      createdAt: serverTimestamp(),
      status: "created",
      verificationTwitterHandle: verificationTwitterHandle,
    };

    if (giftType === "token") {
      //@ts-ignore
      giftData.tokenDetails = {
        name: selectedToken.name,
        image: selectedToken.image,
        address: selectedToken.address,
        amount: amount,
      };
    } else {
      //@ts-ignore
      giftData.nftDetails = {
        name: selectedNFT.name,
        image: selectedNFT.image,
        address: selectedNFT.address,
      };
    }

    const historyEntry = {
      giftId: giftId,
      theme: selectedTheme.name,
      recipientInfo:
        deliveryMethod === "email" ? recipientEmail : "Link Generated",
      giftSummary:
        giftType === "token"
          ? `${amount} ${selectedToken.name}`
          : selectedNFT.name,
      createdAt: serverTimestamp(),
      link: generatedLinkUrl,
    };

    try {
      const giftDocRef = doc(db, "gifts", giftId);
      await setDoc(giftDocRef, giftData);
      console.log(
        "Gift details saved successfully to gifts collection with ID:",
        giftId
      );

      const userHistoryRef = doc(
        db,
        "userGiftHistory",
        walletAddress,
        "history",
        giftId
      );
      await setDoc(userHistoryRef, historyEntry);
      console.log("Gift history updated successfully for user:", walletAddress);
    } catch (error) {
      console.error("Error saving gift details to Firestore:", error);
      throw error;
    }
  };
  //@ts-ignore
  const ApproveToken = async (amountToApprove) => {
    try {
      await approveContract({
        address: MOCK_USDC_CONTRACT_ADDRESS,
        abi: MOCK_USDC_CONTRACT_PARSE_ABI,
        functionName: "approve",
        args: [WOW_CONTRACT_ADDRESS, parseUnits(amountToApprove || "0", 6)],
        chainId: 59141,
      });
    } catch (error) {
      console.error("Error during token approval:", error);
      setIsSubmitting(false);
      throw error;
    }
  };
  //@ts-ignore
  const DepositToken = async (amountToDeposit) => {
    try {
      await depositContract({
        address: WOW_CONTRACT_ADDRESS,
        abi: WOW_CONTRACT_PARSE_ABI,
        functionName: "UserDeposit",
        args: [parseUnits(amountToDeposit || "0", 6)],
        chainId: 59141,
        gas: BigInt(150000),
        maxFeePerGas: parseGwei("20"),
      });
    } catch (error) {
      console.error("Error during token deposit:", error);
      setIsSubmitting(false);
      throw error;
    }
  };
  //@ts-ignore
  const generateLink = (giftId) => {
    const baseUrl = window.location.origin;
    const newLink = `${baseUrl}/gifts/${selectedTheme.name.toLowerCase()}?id=${giftId}`;
    return newLink;
  };

  const handleApproveSuccess = async () => {
    console.log("Token Approved successfully, now depositing...");
    setIsSubmitting(true);
    try {
      await DepositToken(amount);
    } catch (depositError) {
      console.error("Deposit failed after approval:", depositError);
      //@ts-ignore
      alert(`Deposit failed: ${depositError.message || "Unknown deposit error"}`);
      setIsSubmitting(false);
      resetApprove();
      resetDeposit();
    }
  };

  const handleDepositSuccess = async () => {
    if (giftIdForLink) {
      const newLink = generateLink(giftIdForLink);
      setGeneratedLink(newLink);

      if (confettiRef.current) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (approveSuccess) {
      handleApproveSuccess();
      resetApprove();
    }
    if (approveError) {
      console.error("Approve Error:", approveWriteError);
      alert(
        `Token approval failed: ${
          approveWriteError?.message || "Unknown error"
        }`
      );
      setIsSubmitting(false);
      resetApprove();
    }
  }, [
    approveSuccess,
    approveError,
    approveWriteError,
    resetApprove,
    giftIdForLink,
  ]);

  useEffect(() => {
    if (depositSuccess) {
      console.log(`${explorer}tx/${depositData}`);
      handleDepositSuccess();
      resetDeposit();
    }
    if (depositError) {
      console.error("Deposit Error:", depositWriteError);
      alert(
        `Token deposit failed: ${
          depositWriteError?.message || "Unknown deposit error"
        }`
      );
      setIsSubmitting(false);
      resetDeposit();
    }
  }, [
    depositSuccess,
    depositError,
    depositWriteError,
    resetDeposit,
    giftIdForLink,
  ]);

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  //@ts-ignore
  const sendEmail = async (giftId) => {
    const link = generateLink(giftId);

    try {
      await setDoc(doc(db, "mail", giftId), {
        to: [recipientEmail],
        message: {
          subject: `You've received a Gift! from ${walletAddress}`,
          text: `Click this link to claim your gift: ${link}\n\nMessage from the sender: ${message}`,
          html: `<p>Click <a href="${link}">this link</a> to claim your gift!</p><p>Message from the sender: ${message}</p>`,
        },
      });

      console.log("Email queued for delivery!");
      alert(
        `Email forwarded for delivery to ${recipientEmail} with gift link.`
      );
      return link;
    } catch (error) {
      console.error("Error queuing email:", error);
      //@ts-ignore
      alert(`Error queuing email to ${recipientEmail}: ${error.message}`);
      throw error;
    }
  };

  //@ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (generatedLink) {
      console.log("Link already generated for this session.");
      return;
    }

    if (!walletConnected || !walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsSubmitting(true);
    setLinkCopied(false);
    setGeneratedLink("");
    setGiftIdForLink(null);

    const newGiftId = uid(25);
    //@ts-ignore
    setGiftIdForLink(newGiftId);

    try {
      if (deliveryMethod === "link" || deliveryMethod === "email") {
        await ApproveToken(amount);
      } else {
        console.warn("Delivery method not handled:", deliveryMethod);
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Submission failed (Approve Token):", error);
      //@ts-ignore
      alert(`Failed to initiate gift creation: ${error.message}`);
      setGeneratedLink("");
      setIsSubmitting(false);
      setGiftIdForLink(null);
    }
  };

  useEffect(() => {
    if (generatedLink && giftIdForLink) {
      const saveLinkAndDetails = async () => {
        try {
          await saveGiftDetails(giftIdForLink, generatedLink);
          if (deliveryMethod === "email") {
            await sendEmail(giftIdForLink);
          }
          setIsSubmitting(false);
        } catch (saveError) {
          console.error("Error saving gift details:", saveError);
          //@ts-ignore
          alert(`Error saving gift details: ${saveError.message}`);
          setIsSubmitting(false);
        }
      };
      saveLinkAndDetails();
    }
  }, [generatedLink, giftIdForLink, deliveryMethod]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-rose-50">
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mr-3 text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/images/purple.png" alt="wow Logo" className="w-15 h-7" />
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
              {walletAddress.substring(0, 4)}...
              {walletAddress.substring(walletAddress.length - 4)}
            </span>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <motion.div
              className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-xl flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ ease: "easeOut" }}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/purple.png"
                    alt="wow Logo"
                    className="w-15 h-10"
                  />
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="px-2 space-y-1">
                  <a
                    href="#"
                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-purple-50 text-purple-700"
                  >
                    <User className="mr-3 h-5 w-5" /> Dashboard
                  </a>
                  <a
                    href="/pages/history"
                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <History className="mr-3 h-5 w-5" />
                    Gift History
                  </a>
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => disconnect()}
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

      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="md:pl-42 flex flex-col flex-1">
          {/* Main Content Area */}
          <main className="flex-1 pb-8 pt-4 md:pt-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mt-16 md:mt-6">
              <div className="mb-8 hidden md:block">
                <div className="flex items-center">
                  <div
                    className={`flex items-center relative ${
                      currentStep >= 1 ? "text-purple-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 flex items-center justify-center ${
                        currentStep >= 1
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="absolute top-0 -ml-10 text-center mt-16 w-32 text-sm font-medium">
                      Select Gift
                    </div>
                  </div>
                  <div
                    className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                      currentStep >= 2 ? "border-purple-600" : "border-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`flex items-center relative ${
                      currentStep >= 2 ? "text-purple-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 flex items-center justify-center ${
                        currentStep >= 2
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="absolute top-0 -ml-10 text-center mt-16 w-32 text-sm font-medium">
                      Add Message
                    </div>
                  </div>
                  <div
                    className={`flex-auto border-t-2 transition duration-500 ease-in-out ${
                      currentStep >= 3 ? "border-purple-600" : "border-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`flex items-center relative ${
                      currentStep >= 3 ? "text-purple-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 flex items-center justify-center ${
                        currentStep >= 3
                          ? "border-purple-600 bg-purple-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      <Send className="h-6 w-6" />
                    </div>
                    <div className="absolute top-0 -ml-10 text-center mt-16 w-32 text-sm font-medium">
                      Send Gift
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Progress Indicator */}
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentStep === 1 && "Select Gift"}
                  {currentStep === 2 && "Add Message"}
                  {currentStep === 3 && "Send Gift"}
                </h2>
                <div className="flex items-center space-x-1">
                  <div
                    className={`h-2 w-8 rounded-full ${
                      currentStep >= 1 ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`h-2 w-8 rounded-full ${
                      currentStep >= 2 ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`h-2 w-8 rounded-full ${
                      currentStep >= 3 ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Form Steps */}
              <div className="bg-white rounded-xl shadow-lg">
                <div
                  ref={confettiRef}
                  className="absolute inset-0 pointer-events-none"
                ></div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Select Gift */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center md:hidden">
                        <Gift className="mr-2 text-purple-600" /> Select Your
                        Gift
                      </h2>

                      <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setGiftType("token")}
                            className={`relative p-6 rounded-xl border-2 transition-all ${
                              giftType === "token"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-3 p-3 rounded-full bg-purple-100">
                                <Coins
                                  className={`h-8 w-8 ${
                                    giftType === "token"
                                      ? "text-purple-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <h3
                                className={`text-center font-medium ${
                                  giftType === "token"
                                    ? "text-purple-700"
                                    : "text-gray-600"
                                }`}
                              >
                                Token
                              </h3>
                              <p className="text-xs text-center mt-2 text-gray-500">
                                Send cryptocurrency tokens
                              </p>
                            </div>
                            {giftType === "token" && (
                              <div className="absolute top-3 right-3 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => setGiftType("nft")}
                            className={`relative p-6 rounded-xl border-2 transition-all ${
                              giftType === "nft"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-3 p-3 rounded-full bg-purple-100">
                                <ImageIcon
                                  className={`h-8 w-8 ${
                                    giftType === "nft"
                                      ? "text-purple-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <h3
                                className={`text-center font-medium ${
                                  giftType === "nft"
                                    ? "text-purple-700"
                                    : "text-gray-600"
                                }`}
                              >
                                NFT
                              </h3>
                              <p className="text-xs text-center mt-2 text-gray-500">
                                Send digital collectibles
                              </p>
                            </div>
                            {giftType === "nft" && (
                              <div className="absolute top-3 right-3 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>
                        </div>

                        {giftType === "token" ? (
                          <div className="space-y-6">
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Token
                              </label>
                              <button
                                onClick={() =>
                                  setTokenDropdownOpen(!tokenDropdownOpen)
                                }
                                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
                              >
                                <div className="flex items-center">
                                  <img
                                    src={
                                      selectedToken.image || "/placeholder.svg"
                                    }
                                    alt={selectedToken.name}
                                    className="w-6 h-6 mr-2 rounded-full"
                                  />
                                  <span>{selectedToken.name}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              </button>

                              {tokenDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                  {tokenOptions.map((token) => (
                                    <button
                                      key={token.name}
                                      className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors"
                                      onClick={() => {
                                        setSelectedToken(token);
                                        setTokenDropdownOpen(false);
                                      }}
                                    >
                                      <img
                                        src={token.image || "/placeholder.svg"}
                                        alt={token.name}
                                        className="w-6 h-6 mr-2 rounded-full"
                                      />
                                      <span>{token.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                  min="0"
                                />
                                <div className="p-3 bg-gray-100 rounded-r-lg flex items-center border-y border-r border-gray-300">
                                  <img
                                    src={
                                      selectedToken.image || "/placeholder.svg"
                                    }
                                    alt={selectedToken.name}
                                    className="w-5 h-5 mr-2 rounded-full"
                                  />
                                  <span className="text-gray-600 pr-4 font-medium">
                                    {selectedToken.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select NFT
                              </label>
                              <button
                                onClick={() =>
                                  setNftDropdownOpen(!nftDropdownOpen)
                                }
                                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
                              >
                                <div className="flex items-center">
                                  <img
                                    src={
                                      selectedNFT.image || "/placeholder.svg"
                                    }
                                    alt={selectedNFT.name}
                                    className="w-10 h-10 mr-3 rounded-md object-cover"
                                  />
                                  <span>{selectedNFT.name}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              </button>

                              {nftDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                  {nftOptions.map((nft) => (
                                    <button
                                      key={nft.name}
                                      className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors"
                                      onClick={() => {
                                        setSelectedNFT(nft);
                                        setNftDropdownOpen(false);
                                      }}
                                    >
                                      <img
                                        src={nft.image || "/placeholder.svg"}
                                        alt={nft.name}
                                        className="w-10 h-10 mr-3 rounded-md object-cover"
                                      />
                                      <span>{nft.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                              <div className="flex items-start">
                                <img
                                  src={selectedNFT.image || "/placeholder.svg"}
                                  alt={selectedNFT.name}
                                  className="w-16 h-16 rounded-md object-cover mr-4"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-800">
                                    {selectedNFT.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Address: {selectedNFT.address}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={nextStep}
                          disabled={!walletConnected}
                          className={`px-6 py-3 rounded-lg flex items-center ${
                            walletConnected
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Add Message */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center md:hidden">
                        <MessageSquare className="mr-2 text-purple-600" /> Add
                        Your Message
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Personalized Message
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            placeholder="Write a personalized message for your friend..."
                          ></textarea>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {message.length} / 500 characters
                          </span>
                          <button
                            onClick={generateAIMessage}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                          >
                            <Sparkles className="mr-1 h-4 w-4" /> Generate with
                            AI
                          </button>
                        </div>

                        {generatedMessage && (
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                              <Sparkles className="mr-1 h-4 w-4" /> AI Generated
                              Message
                            </h3>
                            <p className="text-gray-700">{generatedMessage}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Twitter Handle
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <TwitterIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                              type="text"
                              value={verificationTwitterHandle}
                              onChange={(e) =>
                                setVerificationTwitterHandle(e.target.value)
                              }
                              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                              placeholder="Twitter handle (for verification, e.g., @friend)"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            This Twitter handle will be used to verify the
                            recipient when claiming the gift.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Theme
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {themeOptions.map((theme) => (
                              <button
                                key={theme.name}
                                onClick={() => setSelectedTheme(theme)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  selectedTheme.name === theme.name
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <img
                                    src={theme.image || "/placeholder.svg"}
                                    alt={theme.name}
                                    className="w-16 h-16 mb-2 rounded-lg object-cover"
                                  />
                                  <h3
                                    className={`text-center text-sm font-medium ${
                                      selectedTheme.name === theme.name
                                        ? "text-purple-700"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {theme.name}
                                  </h3>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between">
                        <button
                          onClick={prevStep}
                          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </button>
                        <button
                          onClick={nextStep}
                          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center"
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Send Gift */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center md:hidden">
                        <Send className="mr-2 text-purple-600" /> Send Your Gift
                      </h2>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setDeliveryMethod("link")}
                            className={`relative p-6 rounded-xl border-2 transition-all ${
                              deliveryMethod === "link"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-3 p-3 rounded-full bg-purple-100">
                                <LinkIcon
                                  className={`h-6 w-6 ${
                                    deliveryMethod === "link"
                                      ? "text-purple-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <h3
                                className={`text-center font-medium ${
                                  deliveryMethod === "link"
                                    ? "text-purple-700"
                                    : "text-gray-600"
                                }`}
                              >
                                Generate Link
                              </h3>
                              <p className="text-xs text-center mt-2 text-gray-500">
                                Create a shareable link
                              </p>
                            </div>
                            {deliveryMethod === "link" && (
                              <div className="absolute top-3 right-3 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => setDeliveryMethod("email")}
                            className={`relative p-6 rounded-xl border-2 transition-all ${
                              deliveryMethod === "email"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-3 p-3 rounded-full bg-purple-100">
                                <Mail
                                  className={`h-6 w-6 ${
                                    deliveryMethod === "email"
                                      ? "text-purple-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <h3
                                className={`text-center font-medium ${
                                  deliveryMethod === "email"
                                    ? "text-purple-700"
                                    : "text-gray-600"
                                }`}
                              >
                                Send Email
                              </h3>
                              <p className="text-xs text-center mt-2 text-gray-500">
                                Deliver via email
                              </p>
                            </div>
                            {deliveryMethod === "email" && (
                              <div className="absolute top-3 right-3 h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </button>
                        </div>

                        {deliveryMethod === "email" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Recipient Email
                            </label>
                            <input
                              type="email"
                              value={recipientEmail}
                              onChange={(e) =>
                                setRecipientEmail(e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                              placeholder="friend@example.com"
                            />
                          </div>
                        )}

                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700 mb-4">
                            Gift Summary
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                              <span className="text-gray-500">Gift Type:</span>
                              <span className="font-medium flex items-center">
                                {giftType === "token" ? (
                                  <>
                                    <Coins className="h-4 w-4 mr-1 text-purple-600" />{" "}
                                    Token
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="h-4 w-4 mr-1 text-purple-600" />{" "}
                                    NFT
                                  </>
                                )}
                              </span>
                            </div>
                            {giftType === "token" ? (
                              <>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                  <span className="text-gray-500">Token:</span>
                                  <span className="font-medium flex items-center">
                                    <img
                                      src={
                                        selectedToken.image ||
                                        "/placeholder.svg"
                                      }
                                      alt={selectedToken.name}
                                      className="w-5 h-5 mr-1 rounded-full"
                                    />
                                    {selectedToken.name}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                  <span className="text-gray-500">Amount:</span>
                                  <span className="font-medium">
                                    {amount} {selectedToken.name}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <span className="text-gray-500">NFT:</span>
                                <span className="font-medium flex items-center">
                                  <img
                                    src={
                                      selectedNFT.image || "/placeholder.svg"
                                    }
                                    alt={selectedNFT.name}
                                    className="w-5 h-5 mr-1 rounded-md"
                                  />
                                  {selectedNFT.name}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Theme:</span>
                              <span className="font-medium flex items-center">
                                <img
                                  src={
                                    selectedTheme.image || "/placeholder.svg"
                                  }
                                  alt={selectedTheme.name}
                                  className="w-5 h-5 mr-1 rounded-md"
                                />
                                {selectedTheme.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {generatedLink && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-purple-50 p-5 rounded-lg border border-purple-100"
                          >
                            <h3 className="text-sm font-medium text-purple-800 mb-3 flex items-center">
                              <Gift className="mr-1 h-4 w-4" /> Gift Link
                              Generated
                            </h3>
                            <div className="flex">
                              <input
                                type="text"
                                readOnly
                                value={generatedLink}
                                className="flex-1 p-2 border border-purple-200 rounded-l-lg bg-white text-sm"
                              />
                              <button
                                onClick={copyLink}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-r-lg flex items-center"
                              >
                                {linkCopied ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-purple-700 mt-2">
                              Share this link with your recipient to let them
                              claim their gift!
                              </p>
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-8 flex justify-between">
                        <button
                          onClick={prevStep}
                          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={
                            isSubmitting ||
                            !walletConnected ||
                            generatedLink ||
                            approveLoading ||
                            depositLoading
                          }
                          className={`px-6 py-3 rounded-lg flex items-center ${
                            isSubmitting ||
                            !walletConnected ||
                            generatedLink ||
                            approveLoading ||
                            depositLoading
                              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          }`}
                        >
                          {isSubmitting || approveLoading || depositLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                              Processing...
                            </>
                          ) : generatedLink ? (
                            "Link Generated!"
                          ) : deliveryMethod === "link" ? (
                            <>
                              Generate Link <Send className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Send Email <Send className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
