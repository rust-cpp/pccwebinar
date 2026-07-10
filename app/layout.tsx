import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGO Capacity Building Webinar | Punjab Charities Commission",
  description: "Register for the Punjab Charities Commission capacity-building training session for NGOs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
