import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { serifDisplay, plexSans, plexMono, handwritten } from "./fonts";
import { NowPlayingProvider } from "@/components/brand/NowPlaying/Provider";
import { TRACKS } from "@/lib/tracks";

export const metadata: Metadata = {
  title: "Sonic Acrylic Games",
  description: "A daily word-and-music puzzle from Sonic Acrylic.",
  metadataBase: new URL("https://games.sonicacrylic.com"),
  openGraph: {
    title: "Sonic Acrylic Games",
    description: "A daily word-and-music puzzle from Sonic Acrylic.",
    type: "website",
  },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#FFF1DE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serifDisplay.variable} ${plexSans.variable} ${plexMono.variable} ${handwritten.variable}`}>
      <body>
        <NowPlayingProvider tracks={TRACKS}>
          <div className="h-dvh flex justify-center">
            <main className="stage w-full max-w-[440px] h-dvh relative overflow-hidden flex flex-col">
              {children}
            </main>
          </div>
        </NowPlayingProvider>
        <Analytics />
      </body>
    </html>
  );
}
