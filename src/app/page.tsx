import Home from "../components/home";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Elisha Yoeli | Portfolio",
  description: "Data Scientist by profession, Full Stack Web Developer by passion currently focused on remote work opportunities.",
  keywords: ["web development", "full-stack", "remote work", "portfolio"],
  authors: [{ name: "Elisha Yoeli", url: "https://elishayoeli.com" }],
  openGraph: {
    title: "Elisha Yoeli| Portfolio",
    description: "Data Scientist by profession, Full Stack Web Developer by passion currently focused on remote work opportunities.",
    type: "website",
    siteName: "Elisha Yoeli | Portfolio",
    images: [
      {
        url: "https://pbs.twimg.com/profile_images/1545149127054475269/Y5LEA7cQ_400x400.jpg",
        // image hosted on random domain/vercelblob - storage container for information 
        width: 800,
        height: 600,
        alt: "Elisha Yoeli | Portfolio",
      },
    ],
  },
};

export default function HomePage() {

  return (
    <>
    <Home />
    </> 
  );
}