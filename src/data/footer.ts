import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
  subheading: string;
  quickLinks: IMenuItem[];
  email: string;
  telephone: string;
  socials: ISocials;
} = {
  subheading:
    "Send personalized gifts onchain, including stable coins, tokens, or NFTs. Celebrate birthdays and special occasions with ease.",
  quickLinks: [
    {
      text: "Features",
      url: "#features",
    },
  ],
  email: "support@wow.com",
  telephone: "+1234567890",
  socials: {
    twitter: "https://twitter.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://www.linkedin.com/company/",
    instagram: "https://www.instagram.com/",
  },
};
