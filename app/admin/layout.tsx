import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sonic Acrylic Games — Admin",
  robots: { index: false, follow: false },
};

/**
 * The admin layout deliberately skips the game chrome (audio player, max-440
 * stage) — we want a full-width data dashboard. We still inherit fonts and
 * the scanline background from the root layout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
