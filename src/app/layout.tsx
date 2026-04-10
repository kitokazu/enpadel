import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EnPadel — Creating meaningful connections through sport.",
  description: "EnPadel — Connection, through play. A community built around padel in Tokyo, Japan.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
