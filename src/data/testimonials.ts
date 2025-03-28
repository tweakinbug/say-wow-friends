import { ITestimonial } from "@/types";
import { siteDetails } from "./siteDetails";

siteDetails.siteName = "WOW!";

export const testimonials: ITestimonial[] = [
  {
    name: "Alice K.",
    role: "Crypto Enthusiast",
    message: `${siteDetails.siteName} made sending my friend a birthday gift in ETH so easy!  The personalized link was a great touch, and they loved the message.  Way better than a gift card!`,
    avatar: "/images/testimonial-1.webp",
  },
  {
    name: "Bob L.",
    role: "NFT Collector",
    message: `I wanted to send a special NFT to celebrate my brother's graduation, and ${siteDetails.siteName} was perfect.  The process was smooth, secure, and he was thrilled to receive it directly in his wallet!`,
    avatar: "/images/testimonial-2.webp",
  },
  {
    name: "Sarah M.",
    role: "Digital Artist",
    message: `As an artist, I love being able to gift my creations directly to fans. ${siteDetails.siteName} makes it simple to send personalized tokens of appreciation. It's a game-changer for community building in the web3 space!`,
    avatar: "/images/testimonial-3.webp",
  },
];
