import type { Metadata } from "next";
import { Crimson_Pro } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import SettingsGear from "./components/SettingsGear";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-crimson",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Munk",
  description: "Daily health intelligence",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" className={crimsonPro.variable}>
      <body>
        <SettingsGear />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
