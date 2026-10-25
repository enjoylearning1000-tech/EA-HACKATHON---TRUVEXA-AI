import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRUVEXA AI — Every Claim Deserves Evidence",
  description:
    "AI-Powered Document Intelligence and Evidence Verification Platform. Cross-verify factual claims, detect contradictions, and trace every fact to verified PDF pages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-[#071426] h-full antialiased">
      <head>
        <meta name="theme-color" content="#071426" />
      </head>
      <body className="min-h-full flex flex-col bg-[#071426] text-white">
        {children}
      </body>
    </html>
  );
}
