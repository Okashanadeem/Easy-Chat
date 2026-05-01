import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { NavProvider } from "@/context/NavContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Easy Chat - AI Classroom Assistant",
  description: "Your digital academic copilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} selection:bg-blue-100 selection:text-blue-700 transition-colors duration-500`}>
        <NavProvider>
          {/* Abstract background blobs for premium feel */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 blur-[120px]" />
          </div>
          
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-[100dvh] w-full relative z-10 overflow-hidden">
            {children}
          </main>
        </NavProvider>
      </body>
    </html>
  );
}
