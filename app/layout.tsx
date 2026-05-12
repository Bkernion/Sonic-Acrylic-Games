import "./globals.css";
import type { Metadata } from "next";
import { newsreader, plexSans, plexMono } from "./fonts";
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
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <NowPlayingProvider tracks={TRACKS}>
          <div className="min-h-dvh flex justify-center">
            <main className="stage w-full max-w-[440px] min-h-dvh relative overflow-hidden flex flex-col">
              {children}
            </main>
          </div>
        </NowPlayingProvider>
      </body>
    </html>
  );
}
