import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { OnboardingProvider } from "../components/OnboardingProvider";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import FeedbackButton from "../components/FeedbackButton";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Coderyx - Developer Tracker",
  description: "A modern coding analytics platform for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            layout: {
              logoImageUrl: "/assets/logo-dark-them.png",
              logoPlacement: "inside"
            },
            elements: {
              logoImage: "h-10 w-auto object-contain",
            }
          }}
        >
          <ThemeProvider>
            <ReactQueryProvider>
              <OnboardingProvider>
                {children}
                <FeedbackButton />
                <Analytics />
              </OnboardingProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
