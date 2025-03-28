import { IFAQ } from "@/types";

const siteDetails = { siteName: "WOW!" };

export const faqs: IFAQ[] = [
  {
    question: `Is ${siteDetails.siteName} secure?`,
    answer:
      "Absolutely.  We use robust encryption to protect your gift details and wallet connection. Your private keys are never stored on our servers. We're built on secure blockchain technology to ensure safe on-chain transactions.",
  },
  {
    question: `Can I use ${siteDetails.siteName} on multiple devices?`,
    answer:
      "Yes, you can access WOW! from any device with a web browser.  Your wallet connection will depend on your chosen wallet provider (e.g., MetaMask), and you'll need to authorize each device separately for security.",
  },
  {
    question: `What types of gifts can I send with ${siteDetails.siteName}?`,
    answer: `You can send a variety of onchain gifts! Currently, we support sending popular stablecoins like USDC, other tokens, and even NFTs. We plan to add support for more assets in the future.`,
  },
  {
    question: `How do I send a gift via email or link?`,
    answer:
      "It's easy! After selecting your gift and personalizing your message, you can choose to either generate a unique, secure gift link or send an email directly to your recipient. The email will include the link and your heartfelt message.",
  },
  {
    question: `What happens when my friend clicks the gift link?`,
    answer: `When your friend clicks the link, they'll be directed to a secure page on ${siteDetails.siteName} where they can view your personalized message and claim their gift. They'll need to connect their wallet to receive the on-chain assets.`,
  },

  {
    question: "What if I need help using the platform?",
    answer:
      "Our dedicated support team is available to assist you!  You can reach us via clementakhimien@gmail.com.  We also offer helpful guides and FAQs within the platform to answer common questions.",
  },
];
