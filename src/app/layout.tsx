import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EnPadel — Creating meaningful connections through sport.",
  description: "EnPadel — Connection, through play. A community built around padel in Tokyo, Japan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
