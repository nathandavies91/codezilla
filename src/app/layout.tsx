import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import StyleRegistry from "./style-registry";

import "./globals.css";

const font = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Code editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StyleRegistry>
      <html lang="en">
        <body className={font.className}>
          <main>
            {children}
          </main>
        </body>
      </html>
    </StyleRegistry>
  );
}
