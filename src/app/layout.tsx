import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { Header } from "@/components/templates/header";

import "./globals.css";

const font = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Codezilla",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
