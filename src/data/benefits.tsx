import {
  FiGift,
  FiMail,
  FiLink,
  FiHeart,
  FiSmile,
  FiSend,
  FiDollarSign,
  FiShield,
  FiUsers,
  FiStar,
  FiPackage,
} from "react-icons/fi";

import { IBenefit } from "@/types";

export const benefits: IBenefit[] = [
  {
    title: "Seamless Gift Sending",
    description:
      "Effortlessly send gifts to your friends onchain with our user-friendly platform.",
    bullets: [
      {
        title: "Personalized Links",
        description:
          "Create personalized links for your gifts to make them extra special.",
        icon: <FiLink size={26} />,
      },
      {
        title: "Email Integration",
        description: "Send gift links directly to your friend's email.",
        icon: <FiMail size={26} />,
      },
      {
        title: "Custom Messages",
        description:
          "Attach a heartfelt message to your gift for a personal touch.",
        icon: <FiHeart size={26} />,
      },
    ],
    imageSrc: "/images/rafiki.svg",
  },
  {
    title: "Versatile Gift Options",
    description:
      "Choose from a variety of gift options including stable coins, tokens, and NFTs.",
    bullets: [
      {
        title: "Stable Coins",
        description: "Send stable coins as a reliable gift option.",
        icon: <FiDollarSign size={26} />,
      },
      {
        title: "Tokens",
        description: "Gift tokens to celebrate special occasions.",
        icon: <FiStar size={26} />,
      },
      {
        title: "NFTs",
        description: "Share unique NFTs as memorable gifts.",
        icon: <FiPackage size={26} />,
      },
    ],
    imageSrc: "/images/pana.svg",
  },
  {
    title: "Enhanced User Experience",
    description:
      "Enjoy a smooth and secure experience while sending and receiving gifts.",
    bullets: [
      {
        title: "User-Friendly Interface",
        description: "Navigate our platform with ease.",
        icon: <FiSmile size={26} />,
      },
      {
        title: "Secure Transactions",
        description: "Ensure your transactions are safe and secure.",
        icon: <FiShield size={26} />,
      },
      {
        title: "Real-Time Notifications",
        description: "Receive instant notifications when your gift is claimed.",
        icon: <FiSend size={26} />,
      },
    ],
    imageSrc: "/images/amico.svg",
  },
];
