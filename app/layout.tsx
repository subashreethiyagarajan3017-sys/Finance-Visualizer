import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VantageFin Pro — Personal Finance Visualizer",
  description: "Premium executive dashboard for tracking expenses, managing budgets, generating financial reports, and running what-if scenarios.",
  keywords: ["finance", "budget", "expense tracker", "dashboard", "personal finance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
