import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// Initialize fonts with CSS variables
const geistSans = Geist({
  variable: "--font-geist-sans", // Defines the CSS variable
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Defines the CSS variable
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AI Steam Game Recommender - Find Your Perfect Game",
  description:
    "Discover your next favorite game using AI-powered vibe search. Describe your mood and get personalized Steam game recommendations.",
  generator: "v0.app",
  // ... rest of metadata unchanged
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        // Apply both font variables + antialiasing
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
